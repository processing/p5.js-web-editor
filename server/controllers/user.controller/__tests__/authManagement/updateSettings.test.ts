import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { User } from '../../../../models/user';
import { updateSettings } from '../../authManagement';
import { saveUser, generateToken } from '../../helpers';
import { createMockUser } from '../../__testUtils__';

import { mailerService } from '../../../../utils/mail';
import { UpdateSettingsRequestBody, UserDocument } from '../../../../types';

jest.mock('../../../../models/user');
jest.mock('../../../../utils/mail');
jest.mock('../../../../views/mail');
jest.mock('../../helpers', () => ({
  ...jest.requireActual('../../helpers'), // use actual userResponse
  saveUser: jest.fn(),
  generateToken: jest.fn()
}));

describe('user.controller > auth management > updateSettings (email, username, password)', () => {
  let request: MockRequest;
  let response: MockResponse;
  let next: MockNext;
  let requestBody: UpdateSettingsRequestBody;
  let startingUser: Partial<UserDocument>; // copy of found user that won't be mutated in test
  let testUser: Partial<UserDocument>; // found and mutated user

  const fixedTime = 100000000;
  const GENERATED_TOKEN = 'new-token-1io23jijo';
  const STATUSES = { Sent: 'sent' };
  const TOKEN_EXPIRY_TIME = 186400000;

  const OLD_USERNAME = 'oldusername';
  const NEW_USERNAME = 'newusername';

  const OLD_EMAIL = 'old@email.com';
  const NEW_EMAIL = 'new@email.com';

  const OLD_PASSWORD = 'oldpassword';
  const NEW_PASSWORD = 'newpassword';

  // minimum valid request body
  const minimumValidRequest: UpdateSettingsRequestBody = {
    username: OLD_USERNAME,
    email: OLD_EMAIL
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();

    startingUser = createMockUser(
      {
        username: OLD_USERNAME,
        email: OLD_EMAIL,
        password: OLD_PASSWORD,
        id: '123459',
        comparePassword: jest.fn().mockResolvedValue(true)
      },
      false
    ) as UserDocument;

    testUser = { ...startingUser }; // copy to avoid mutation causing false-positive tests results

    User.findById = jest.fn().mockResolvedValue(testUser);
    User.EmailConfirmation = jest.fn().mockReturnValue(STATUSES);
    (saveUser as jest.Mock).mockResolvedValue(null);
    (generateToken as jest.Mock).mockResolvedValue(GENERATED_TOKEN);
    (mailerService.send as jest.Mock).mockResolvedValue(true);

    request.user = createMockUser({ id: 'valid-id' });
    request.headers.host = 'localhost:3000';
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('if the user is not found', () => {
    beforeEach(async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      request.user = createMockUser({ id: 'nonexistent-id' });

      await updateSettings(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
    });

    it('returns 404 and a user-not-found error', async () => {
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('does not save the user', () => {
      expect(saveUser).not.toHaveBeenCalled();
    });
  });

  describe('if the user is found', () => {
    describe('happy paths:', () => {
      describe('when given old username and old email', () => {
        beforeEach(async () => {
          requestBody = { ...minimumValidRequest };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details exactly once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, { ...startingUser });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      // duplicate username check happens client-side before this request is made
      describe('when given new username and old email', () => {
        beforeEach(async () => {
          requestBody = { ...minimumValidRequest, username: NEW_USERNAME };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details exactly once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            username: NEW_USERNAME
          });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when given old username and new email', () => {
        beforeEach(async () => {
          requestBody = { ...minimumValidRequest, email: NEW_EMAIL };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details & verification token once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            email: NEW_EMAIL,
            verified: STATUSES.Sent,
            verifiedToken: GENERATED_TOKEN,
            verifiedTokenExpires: TOKEN_EXPIRY_TIME
          });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('sends a confirmation email to the user', () => {
          expect(mailerService.send).toHaveBeenCalledWith(
            expect.objectContaining({
              subject: 'Mock confirm your email'
            })
          );
        });
      });

      describe('when given new username and new email', () => {
        beforeEach(async () => {
          requestBody = { username: NEW_USERNAME, email: NEW_EMAIL };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            username: NEW_USERNAME,
            email: NEW_EMAIL,
            verified: STATUSES.Sent,
            verifiedToken: GENERATED_TOKEN,
            verifiedTokenExpires: TOKEN_EXPIRY_TIME
          });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('sends a confirmation email to the user', () => {
          expect(mailerService.send).toHaveBeenCalledWith(
            expect.objectContaining({
              subject: 'Mock confirm your email'
            })
          );
        });
      });

      describe('when given old username, old email, and matching current password and new password', () => {
        beforeEach(async () => {
          requestBody = {
            ...minimumValidRequest,
            currentPassword: OLD_PASSWORD,
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            password: NEW_PASSWORD
          });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when given new username, old email, and new password with valid current password', () => {
        beforeEach(async () => {
          requestBody = {
            ...minimumValidRequest,
            username: NEW_USERNAME,
            currentPassword: OLD_PASSWORD,
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            username: NEW_USERNAME,
            password: NEW_PASSWORD
          });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe.skip('when given old username, new email, and new password with valid current password', () => {
        beforeEach(async () => {
          requestBody = {
            ...minimumValidRequest,
            email: NEW_EMAIL,
            currentPassword: OLD_PASSWORD,
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            email: NEW_EMAIL,
            verified: STATUSES.Sent,
            verifiedToken: GENERATED_TOKEN,
            verifiedTokenExpires: TOKEN_EXPIRY_TIME,
            password: NEW_PASSWORD
          });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('sends a confirmation email to the user', () => {
          expect(mailerService.send).toHaveBeenCalledWith(
            expect.objectContaining({
              subject: 'Mock confirm your email'
            })
          );
        });
      });

      describe.skip('when given new username, new email, and new password with valid current password', () => {
        beforeEach(async () => {
          requestBody = {
            username: NEW_USERNAME,
            email: NEW_EMAIL,
            currentPassword: OLD_PASSWORD,
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details once', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            username: NEW_USERNAME,
            email: NEW_EMAIL,
            verified: STATUSES.Sent,
            verifiedToken: GENERATED_TOKEN,
            verifiedTokenExpires: TOKEN_EXPIRY_TIME,
            password: NEW_PASSWORD
          });
          expect(saveUser).toHaveBeenCalledTimes(1);
        });
        it('sends a confirmation email to the user', () => {
          expect(mailerService.send).toHaveBeenCalledWith(
            expect.objectContaining({
              subject: 'Mock confirm your email'
            })
          );
        });
      });
    });

    describe('unhappy paths', () => {
      // Client-side checks to require username
      describe.skip('when missing username', () => {
        beforeEach(async () => {
          request.setBody({ email: OLD_EMAIL });
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 401 with an "Missing username" message', () => {
          expect(response.status).toHaveBeenCalledWith(400);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Username is required.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      // Client-side checks to require email
      describe.skip('when missing email', () => {
        beforeEach(async () => {
          request.setBody({ username: OLD_USERNAME });
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 401 with an "Missing email" message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Email is required.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      // Client-side checks to require new password if current password is provided
      describe.skip('when given old username, old email, and matching current password and no new password', () => {
        beforeEach(async () => {
          requestBody = {
            ...minimumValidRequest,
            currentPassword: OLD_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 401 with an "New password is required" message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'New password is required.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when given old username, old email, and non-matching current password and no new password', () => {
        beforeEach(async () => {
          testUser.comparePassword = jest.fn().mockResolvedValue(false);

          requestBody = {
            ...minimumValidRequest,
            currentPassword: 'not the same password',
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 401 with an "Current password is invalid" message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Current password is invalid.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when given old username, old email, and non-matching current password and a new password', () => {
        beforeEach(async () => {
          testUser.comparePassword = jest.fn().mockResolvedValue(false);

          requestBody = {
            ...minimumValidRequest,
            currentPassword: 'not the same password',
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 401 with an error message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Current password is invalid.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when given old username, old email, and no current password and a new password', () => {
        beforeEach(async () => {
          requestBody = {
            ...minimumValidRequest,
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 401 with an error message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Current password is not provided.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('and when there is any other error', () => {
    beforeEach(async () => {
      User.findById = jest.fn().mockRejectedValue('db error');
      requestBody = minimumValidRequest;
      request.setBody(requestBody);
      await updateSettings(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
    });
    it('returns a 500 error', () => {
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({ error: 'db error' });
    });
  });
});
