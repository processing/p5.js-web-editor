import crypto from 'crypto';
import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { User } from '../../../models/user';
import { initiateStepUpCode, verifyStepUp } from '../stepUp';
import { createMockUser } from '../__testUtils__';
import { mailerService } from '../../../utils/mail';
import { renderStepUpCode } from '../../../views/mail';
import { STEP_UP_WINDOW_MS } from '../../../middleware/requireStepUp';
import { UserDocument } from '../../../types';

jest.mock('../../../models/user');
jest.mock('../../../utils/mail');
jest.mock('../../../views/mail');

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

describe('user.controller > stepUp', () => {
  let request: MockRequest;
  let response: MockResponse;
  let next: MockNext;
  let session: Record<string, any>;

  const fixedTime = 100000000;
  const CODE = '123456';

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const mockFoundUser = (overrides: Partial<UserDocument>) => {
    const user = createMockUser(
      {
        id: '123459',
        email: 'owner@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
        ...overrides
      },
      true
    ) as UserDocument;
    User.findById = jest.fn().mockResolvedValue(user);
    return user;
  };

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();
    session = {};
    (request as any).session = session;
    request.user = createMockUser({ id: '123459' });
    (mailerService.send as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  describe('initiateStepUpCode', () => {
    it('returns 400 for accounts with a password', async () => {
      mockFoundUser({ password: 'hashed' });
      await initiateStepUpCode(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
      expect(response.status).toHaveBeenCalledWith(400);
      expect(mailerService.send).not.toHaveBeenCalled();
      expect(session.stepUpCode).toBeUndefined();
    });

    it('stores only a hash of a 6-digit code and emails the code to the account address', async () => {
      mockFoundUser({ password: undefined });
      await initiateStepUpCode(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      const sentCode = (renderStepUpCode as jest.Mock).mock.calls[0][0].body
        .code;
      expect(sentCode).toMatch(/^\d{6}$/);
      expect(session.stepUpCode).toMatchObject({
        hash: sha256(sentCode),
        expiresAt: fixedTime + 10 * 60 * 1000,
        attempts: 0,
        sentAt: fixedTime
      });
      // the plain code is never kept in the session
      expect(JSON.stringify(session)).not.toContain(sentCode);
      expect(renderStepUpCode).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'owner@example.com' })
      );
      expect(mailerService.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Mock step-up code' })
      );
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: 'A verification code has been sent to your email address.'
      });
    });

    it('refuses to resend a code within 60 seconds', async () => {
      mockFoundUser({ password: undefined });
      session.stepUpCode = {
        hash: sha256(CODE),
        expiresAt: fixedTime + 10 * 60 * 1000,
        attempts: 0,
        sentAt: fixedTime - 30 * 1000
      };
      await initiateStepUpCode(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
      expect(response.status).toHaveBeenCalledWith(429);
      expect(mailerService.send).not.toHaveBeenCalled();
    });

    it('sends a fresh code once 60 seconds have passed', async () => {
      mockFoundUser({ password: undefined });
      session.stepUpCode = {
        hash: sha256(CODE),
        expiresAt: fixedTime + 10 * 60 * 1000,
        attempts: 3,
        sentAt: fixedTime - 61 * 1000
      };
      await initiateStepUpCode(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
      expect(mailerService.send).toHaveBeenCalled();
      expect(session.stepUpCode.attempts).toBe(0);
      expect(session.stepUpCode.sentAt).toBe(fixedTime);
    });
  });

  describe('verifyStepUp', () => {
    describe('for accounts with a password', () => {
      it('succeeds with the correct password and marks the session', async () => {
        const user = mockFoundUser({
          password: 'hashed',
          comparePassword: jest.fn().mockResolvedValue(true)
        });
        request.setBody({ password: 'correct horse' });

        await verifyStepUp(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(user.comparePassword).toHaveBeenCalledWith('correct horse');
        expect(session.stepUpAt).toBe(fixedTime);
        expect(response.json).toHaveBeenCalledWith({
          success: true,
          expiresAt: fixedTime + STEP_UP_WINDOW_MS
        });
      });

      it('fails with a wrong password', async () => {
        mockFoundUser({
          password: 'hashed',
          comparePassword: jest.fn().mockResolvedValue(false)
        });
        request.setBody({ password: 'wrong' });

        await verifyStepUp(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(session.stepUpAt).toBeUndefined();
        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.json).toHaveBeenCalledWith({
          error: 'Step-up failed'
        });
      });

      it('ignores a code sent to a password account', async () => {
        mockFoundUser({ password: 'hashed' });
        session.stepUpCode = {
          hash: sha256(CODE),
          expiresAt: fixedTime + 10 * 60 * 1000,
          attempts: 0,
          sentAt: fixedTime
        };
        request.setBody({ code: CODE });

        await verifyStepUp(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(session.stepUpAt).toBeUndefined();
        expect(response.status).toHaveBeenCalledWith(401);
      });
    });

    describe('for accounts without a password', () => {
      const validCodeState = () => ({
        hash: sha256(CODE),
        expiresAt: fixedTime + 10 * 60 * 1000,
        attempts: 0,
        sentAt: fixedTime
      });

      beforeEach(() => {
        mockFoundUser({ password: undefined });
      });

      it('succeeds with the correct code and clears it', async () => {
        session.stepUpCode = validCodeState();
        request.setBody({ code: CODE });

        await verifyStepUp(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(session.stepUpAt).toBe(fixedTime);
        expect(session.stepUpCode).toBeUndefined();
        expect(response.json).toHaveBeenCalledWith({
          success: true,
          expiresAt: fixedTime + STEP_UP_WINDOW_MS
        });
      });

      it('fails when no code was requested', async () => {
        request.setBody({ code: CODE });

        await verifyStepUp(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(session.stepUpAt).toBeUndefined();
        expect(response.status).toHaveBeenCalledWith(401);
      });

      it('fails with an expired code', async () => {
        session.stepUpCode = { ...validCodeState(), expiresAt: fixedTime };
        request.setBody({ code: CODE });

        await verifyStepUp(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(session.stepUpAt).toBeUndefined();
        expect(response.status).toHaveBeenCalledWith(401);
      });

      it('counts failed attempts and invalidates the code after 5 failures', async () => {
        session.stepUpCode = validCodeState();

        /* eslint-disable no-await-in-loop */
        for (let attempt = 1; attempt <= 5; attempt += 1) {
          request.setBody({ code: '000000' });
          await verifyStepUp(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
          expect(response.status).toHaveBeenCalledWith(401);
          if (attempt < 5) {
            expect(session.stepUpCode.attempts).toBe(attempt);
          }
        }
        /* eslint-enable no-await-in-loop */

        // 5th failure removes the code entirely
        expect(session.stepUpCode).toBeUndefined();

        // even the correct code no longer works
        request.setBody({ code: CODE });
        await verifyStepUp(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
        expect(session.stepUpAt).toBeUndefined();
      });
    });

    it('returns 404 when the user is not found', async () => {
      User.findById = jest.fn().mockResolvedValue(null);
      request.setBody({ password: 'whatever' });

      await verifyStepUp(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(404);
    });
  });
});
