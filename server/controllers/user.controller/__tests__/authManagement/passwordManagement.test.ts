import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { User } from '../../../../models/user';
import {
  resetPasswordInitiate,
  validateResetPasswordToken,
  updatePassword
} from '../../authManagement';
import { generateToken } from '../../helpers';
import { createMockUser } from '../../__testUtils__';

import { mailerService } from '../../../../utils/mail';
import {
  ResetOrUpdatePasswordRequestParams,
  UserDocument
} from '../../../../types';

jest.mock('../../../../models/user');
jest.mock('../../../../utils/mail');
jest.mock('../../../../utils/editorUrl', () => ({
  getEditorUrl: jest.fn(() => 'https://editor.example')
}));
jest.mock('../../helpers', () => ({
  ...jest.requireActual('../../helpers'),
  generateToken: jest.fn()
}));

describe('user.controller > auth management > password management', () => {
  let request: MockRequest;
  let response: MockResponse;
  let next: MockNext;
  let mockToken: string;
  let mockUser: UserDocument;
  const fixedTime = 100000000;

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  describe('resetPasswordInitiate', () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(fixedTime);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('calls User.findByEmail with the correct email', async () => {
      User.findByEmail = jest.fn().mockResolvedValue({});
      request.body = { email: 'email@gmail.com' };
      await resetPasswordInitiate(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(User.findByEmail).toHaveBeenCalledWith('email@gmail.com');
    });

    describe('if the user is found', () => {
      beforeEach(async () => {
        mockToken = 'mock-token';
        mockUser = createMockUser(
          {
            email: 'test@example.com',
            save: jest.fn().mockResolvedValue(null)
          },
          false
        ) as UserDocument;

        (generateToken as jest.Mock).mockResolvedValue(mockToken);
        User.findByEmail = jest.fn().mockResolvedValue(mockUser);

        request.body = { email: 'test@example.com' };
        request.headers.host = 'localhost:3000';

        await resetPasswordInitiate(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('sets a resetPasswordToken with an expiry of 1h to the user', () => {
        expect(mockUser.resetPasswordToken).toBe(mockToken);
        expect(mockUser.resetPasswordExpires).toBe(fixedTime + 3600000);
        expect(mockUser.save).toHaveBeenCalled();
      });
      it('sends the reset password email', () => {
        expect(mailerService.send).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test@example.com',
            body: expect.objectContaining({
              link: expect.stringContaining(mockToken)
            })
          })
        );
      });
      it('returns a success message that does not indicate if the user exists, for security purposes', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message:
            'If the email is registered with the editor, an email has been sent.'
        });
      });
    });
    describe.each([
      ['their signup email is unconfirmed', { verified: 'sent' }],
      [
        'they re-requested confirmation but never confirmed',
        { verified: 'resent' }
      ],
      ['their account predates email verification', { verified: undefined }]
    ])('if the user is found and %s', (_label, overrides) => {
      beforeEach(async () => {
        mockToken = 'mock-token';
        mockUser = createMockUser(
          {
            email: 'test@example.com',
            ...overrides,
            save: jest.fn().mockResolvedValue(null)
          },
          false
        ) as UserDocument;

        (generateToken as jest.Mock).mockResolvedValue(mockToken);
        User.findByEmail = jest.fn().mockResolvedValue(mockUser);

        request.body = { email: 'test@example.com' };
        request.headers.host = 'localhost:3000';

        await resetPasswordInitiate(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('still sets a reset token and sends the reset password email', () => {
        expect(mockUser.resetPasswordToken).toBe(mockToken);
        expect(mockUser.save).toHaveBeenCalled();
        expect(mailerService.send).toHaveBeenCalledWith(
          expect.objectContaining({ to: 'test@example.com' })
        );
      });
    });

    describe('if the user is found but banned', () => {
      beforeEach(async () => {
        mockToken = 'mock-token';
        mockUser = createMockUser(
          {
            email: 'test@example.com',
            banned: true,
            save: jest.fn().mockResolvedValue(null)
          },
          true
        ) as UserDocument;
        mockUser.resetPasswordToken = undefined;

        (generateToken as jest.Mock).mockResolvedValue(mockToken);
        User.findByEmail = jest.fn().mockResolvedValue(mockUser);

        request.body = { email: 'test@example.com' };

        await resetPasswordInitiate(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('does not set a reset token or send the reset password email', () => {
        expect(mockUser.resetPasswordToken).toBeUndefined();
        expect(mockUser.save).not.toHaveBeenCalled();
        expect(mailerService.send).not.toHaveBeenCalled();
      });
      it('returns the same success message as every other outcome, for security purposes', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message:
            'If the email is registered with the editor, an email has been sent.'
        });
      });
    });

    describe.each([
      ['a query operator object', { $gt: '' }],
      ['an array of addresses', ['a@example.com', 'b@example.com']],
      ['missing', undefined],
      ['a number', 42]
    ])('if the email is %s', (_label, email) => {
      beforeEach(async () => {
        User.findByEmail = jest.fn();
        request.body = { email };

        await resetPasswordInitiate(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('does not query the database or send an email', () => {
        expect(User.findByEmail).not.toHaveBeenCalled();
        expect(generateToken).not.toHaveBeenCalled();
        expect(mailerService.send).not.toHaveBeenCalled();
      });
      it('returns the same success message as every other outcome, for security purposes', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message:
            'If the email is registered with the editor, an email has been sent.'
        });
      });
    });

    describe('if the user is not found', () => {
      beforeEach(() => {
        mockToken = 'mock-token';

        (generateToken as jest.Mock).mockResolvedValue(mockToken);
        User.findByEmail = jest.fn().mockResolvedValue(null);

        request.body = { email: 'test@example.com' };
        request.headers.host = 'localhost:3000';
      });
      it('does not send the reset password email', async () => {
        await resetPasswordInitiate(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(mailerService.send).not.toHaveBeenCalledWith();
      });
      it('returns a success message that does not indicate if the user exists, for security purposes', async () => {
        await resetPasswordInitiate(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );

        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message:
            'If the email is registered with the editor, an email has been sent.'
        });
      });
    });
    it('returns unsuccessful for all other errors', async () => {
      mockToken = 'mock-token';
      mockUser = createMockUser(
        {
          email: 'test@example.com',
          save: jest.fn().mockResolvedValue(null)
        },
        false
      ) as UserDocument;

      (generateToken as jest.Mock).mockRejectedValue(
        new Error('network error')
      );
      User.findByEmail = jest.fn().mockResolvedValue(null);

      request.body = { email: 'test@example.com' };
      request.headers.host = 'localhost:3000';

      await resetPasswordInitiate(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.json).toHaveBeenCalledWith({
        success: false
      });
    });
  });

  describe('validateResetPasswordToken', () => {
    beforeAll(() => jest.useFakeTimers().setSystemTime(fixedTime));
    afterAll(() => jest.useRealTimers());

    it('calls User.findone with the correct token and expiry', async () => {
      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn()
      });

      request.params = { token: 'some-token' };

      await validateResetPasswordToken(
        (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
        (response as unknown) as Response,
        next
      );

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: 'some-token',
        resetPasswordExpires: { $gt: fixedTime }
      });
    });

    describe('and when no user is found', () => {
      beforeEach(async () => {
        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        });

        request.params = { token: 'invalid-token' };

        await validateResetPasswordToken(
          (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
          (response as unknown) as Response,
          next
        );
      });
      it('returns a 401', () => {
        expect(response.status).toHaveBeenCalledWith(401);
      });
      it('returns a "invalid or expired" token message', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'Password reset token is invalid or has expired.'
        });
      });
    });

    describe('and when the user with a valid token is banned', () => {
      beforeEach(async () => {
        const bannedUser = createMockUser(
          {
            email: 'test@example.com',
            resetPasswordToken: 'valid-token',
            resetPasswordExpires: fixedTime + 10000, // still valid
            banned: true
          },
          true
        );

        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(bannedUser)
        });

        request.params = { token: 'valid-token' };

        await validateResetPasswordToken(
          (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
          (response as unknown) as Response,
          next
        );
      });
      it('returns the same 401 as an invalid token', () => {
        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'Password reset token is invalid or has expired.'
        });
      });
    });

    describe('and when there is a user with valid token', () => {
      beforeEach(async () => {
        const fakeUser = createMockUser({
          email: 'test@example.com',
          resetPasswordToken: 'valid-token',
          resetPasswordExpires: fixedTime + 10000 // still valid
        });

        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(fakeUser)
        });

        request.params = { token: 'valid-token' };

        await validateResetPasswordToken(
          (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
          (response as unknown) as Response,
          next
        );
      });
      it('returns a success response', () => {
        expect(response.json).toHaveBeenCalledWith({ success: true });
      });
    });
  });

  describe('updatePassword', () => {
    beforeAll(() => jest.useFakeTimers().setSystemTime(fixedTime));
    afterAll(() => jest.useRealTimers());

    it('calls User.findone with the correct token and expiry', async () => {
      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn()
      });

      request.params = { token: 'some-token' };

      await updatePassword(
        (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
        (response as unknown) as Response,
        next
      );

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: 'some-token',
        resetPasswordExpires: { $gt: fixedTime }
      });
    });

    describe('and when no user is found', () => {
      beforeEach(async () => {
        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        });

        request.params = { token: 'invalid-token' };

        await updatePassword(
          (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
          (response as unknown) as Response,
          next
        );
      });
      it('returns a 401', () => {
        expect(response.status).toHaveBeenCalledWith(401);
      });
      it('returns a "invalid or expired" token message', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'Password reset token is invalid or has expired.'
        });
      });
    });

    describe('and when the user with a valid token is banned', () => {
      beforeEach(async () => {
        mockUser = {
          ...createMockUser({ email: 'test@example.com' }, true),
          password: 'oldpassword',
          resetPasswordToken: 'valid-token',
          resetPasswordExpires: fixedTime + 10000, // still valid
          banned: true,
          sessionVersion: 0,
          save: jest.fn()
        } as UserDocument;

        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        });

        request.params = { token: 'valid-token' };
        request.setBody({ password: 'newpassword' });
        request.logIn = jest.fn();

        await updatePassword(
          (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
          (response as unknown) as Response,
          next
        );
      });
      it('returns the same 401 as an invalid token', () => {
        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'Password reset token is invalid or has expired.'
        });
      });
      it('does not change the password or log the user in', () => {
        expect(mockUser.password).toBe('oldpassword');
        expect(mockUser.save).not.toHaveBeenCalled();
        expect(request.logIn).not.toHaveBeenCalled();
      });
    });

    describe('and when there is a user with valid token', () => {
      const sanitisedMockUser = createMockUser({ email: 'test@example.com' });

      beforeEach(async () => {
        mockUser = {
          ...sanitisedMockUser,
          password: 'oldpassword',
          resetPasswordToken: 'valid-token',
          resetPasswordExpires: fixedTime + 10000, // still valid
          verified: 'sent',
          verifiedToken: 'pending-verify-token',
          sessionVersion: 0,
          save: jest.fn()
        } as UserDocument;

        User.EmailConfirmation = jest
          .fn()
          .mockReturnValue({ Verified: 'verified', Sent: 'sent' });

        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        });

        request.params = { token: 'valid-token' };
        request.setBody({
          password: 'newpassword'
        });

        // simulate logging in after resetting the password works
        request.logIn = jest.fn((user, cb) => {
          request.user = user;
          cb(null);
        });

        await updatePassword(
          (request as unknown) as Request<ResetOrUpdatePasswordRequestParams>,
          (response as unknown) as Response,
          next
        );
      });
      it('calls user.save with the updated password and removes the reset password token', () => {
        expect(mockUser.password).toBe('newpassword');
        expect(mockUser.resetPasswordToken).toBeUndefined();
        expect(mockUser.resetPasswordExpires).toBeUndefined();
        expect(mockUser.save).toHaveBeenCalled();
      });
      it('marks the email as confirmed, since the reset link proved inbox ownership', () => {
        expect(mockUser.verified).toBe('verified');
        expect(mockUser.verifiedToken).toBeNull();
        expect(mockUser.verifiedTokenExpires).toBeNull();
      });
      it('returns a success response with the sanitised user', () => {
        expect(response.json).toHaveBeenCalledWith(sanitisedMockUser);
      });
      it('revokes other sessions and re-logs-in the current request', () => {
        expect(mockUser.sessionVersion).toBe(1);
        expect(request.logIn).toHaveBeenCalled();
      });
    });
  });
});
