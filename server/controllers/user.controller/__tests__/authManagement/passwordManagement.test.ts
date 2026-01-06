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

    describe('and when there is a user with valid token', () => {
      const sanitisedMockUser = createMockUser({ email: 'test@example.com' });
      mockUser = {
        ...sanitisedMockUser,
        password: 'oldpassword',
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: fixedTime + 10000, // still valid
        save: jest.fn()
      } as UserDocument;

      beforeEach(async () => {
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
      it('returns a success response with the sanitised user', () => {
        expect(response.json).toHaveBeenCalledWith(sanitisedMockUser);
      });
    });
  });
});
