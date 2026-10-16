import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { User } from '../../../../models/user';
import { updateSettings } from '../../authManagement';
import { saveUser, generateToken } from '../../helpers';
import { createMockUser } from '../../__testUtils__';

import { mailerService } from '../../../../utils/mail';
import { renderEmailConfirmation } from '../../../../views/mail';
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

  /** Marks the current session as recently stepped-up (POST /account/step-up) */
  const givenRecentStepUp = () => {
    (request as any).session = { stepUpAt: fixedTime };
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
        sessionVersion: 0,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(null)
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
    (request as any).session = {};
    (request as any).logIn = jest.fn(
      (_user: unknown, cb: (err?: unknown) => void) => cb()
    );
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
      expect(testUser.save).not.toHaveBeenCalled();
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
        it('does not revoke other sessions', () => {
          expect(testUser.sessionVersion).toBe(0);
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
        it('does not require a step-up or current password', () => {
          expect(response.status).not.toHaveBeenCalledWith(403);
          expect(testUser.comparePassword).not.toHaveBeenCalled();
        });
      });

      describe('when given old username and new email, after a recent step-up', () => {
        const previousEditorUrl = process.env.EDITOR_URL;

        beforeEach(async () => {
          process.env.EDITOR_URL = 'https://editor.p5js.org';
          givenRecentStepUp();
          requestBody = { ...minimumValidRequest, email: NEW_EMAIL };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        afterEach(() => {
          process.env.EDITOR_URL = previousEditorUrl;
        });
        it('saves the user with the correct details & verification token once', () => {
          expect(testUser.save).toHaveBeenCalledTimes(1);
          expect(testUser).toMatchObject({
            email: NEW_EMAIL,
            verified: STATUSES.Sent,
            verifiedToken: GENERATED_TOKEN,
            verifiedTokenExpires: TOKEN_EXPIRY_TIME
          });
        });
        it('responds with the sanitised user', () => {
          expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({ email: NEW_EMAIL, hasPassword: true })
          );
        });
        it('revokes other sessions and keeps the current one', () => {
          expect(testUser.sessionVersion).toBe(1);
          expect((request as any).logIn).toHaveBeenCalled();
        });
        it('sends a confirmation email to the new address and a notice to the old one', () => {
          expect(mailerService.send).toHaveBeenCalledWith(
            expect.objectContaining({
              subject: 'Mock confirm your email'
            })
          );
          expect(mailerService.send).toHaveBeenCalledWith(
            expect.objectContaining({
              subject: 'Mock email changed notice'
            })
          );
        });
        it('renders the verification email with a public logo origin and the request verification link', () => {
          expect(renderEmailConfirmation).toHaveBeenCalledWith({
            body: {
              domain: 'https://editor.p5js.org',
              link: `http://localhost:3000/verify?t=${GENERATED_TOKEN}`
            },
            to: NEW_EMAIL
          });
        });
      });

      describe('when the email changes while a reset token is outstanding', () => {
        beforeEach(async () => {
          testUser.resetPasswordToken = 'old-reset-token';
          testUser.resetPasswordExpires = fixedTime + 3600000;
          givenRecentStepUp();
          requestBody = { ...minimumValidRequest, email: NEW_EMAIL };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('invalidates the reset token issued for the previous address', () => {
          expect(testUser.resetPasswordToken).toBeUndefined();
          expect(testUser.resetPasswordExpires).toBeUndefined();
          expect(testUser.save).toHaveBeenCalledTimes(1);
        });
      });

      describe('when given new username and new email with a valid current password', () => {
        beforeEach(async () => {
          requestBody = {
            username: NEW_USERNAME,
            email: NEW_EMAIL,
            currentPassword: OLD_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });
        it('saves the user with the correct details once', () => {
          expect(testUser.save).toHaveBeenCalledTimes(1);
          expect(testUser).toMatchObject({
            username: NEW_USERNAME,
            email: NEW_EMAIL,
            verified: STATUSES.Sent,
            verifiedToken: GENERATED_TOKEN,
            verifiedTokenExpires: TOKEN_EXPIRY_TIME
          });
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
        it('saves the user with the new password once', () => {
          expect(testUser.save).toHaveBeenCalledTimes(1);
          expect(testUser.password).toBe(NEW_PASSWORD);
        });
        it('revokes other sessions and keeps the current one', () => {
          expect(testUser.sessionVersion).toBe(1);
          expect((request as any).logIn).toHaveBeenCalled();
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
          expect(testUser.save).toHaveBeenCalledTimes(1);
          expect(testUser).toMatchObject({
            username: NEW_USERNAME,
            password: NEW_PASSWORD
          });
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when a user without a password sets a first password after a recent step-up', () => {
        beforeEach(async () => {
          testUser.password = undefined;
          givenRecentStepUp();
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
        it('saves the user with the new password once', () => {
          expect(testUser.save).toHaveBeenCalledTimes(1);
          expect(testUser.password).toBe(NEW_PASSWORD);
        });
        it('revokes other sessions', () => {
          expect(testUser.sessionVersion).toBe(1);
        });
      });
    });

    describe('unhappy paths', () => {
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

        it('returns 401 with an "Current password is invalid" message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Current password is invalid.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
          expect(testUser.save).not.toHaveBeenCalled();
          expect(testUser.password).toBe(OLD_PASSWORD);
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when given a new email with a non-matching current password', () => {
        beforeEach(async () => {
          testUser.comparePassword = jest.fn().mockResolvedValue(false);

          requestBody = {
            ...minimumValidRequest,
            email: NEW_EMAIL,
            currentPassword: 'not the same password'
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

        it('does not change the email', () => {
          expect(saveUser).not.toHaveBeenCalled();
          expect(testUser.save).not.toHaveBeenCalled();
          expect(testUser.email).toBe(OLD_EMAIL);
        });
      });

      describe('when given a new password with no current password and no recent step-up', () => {
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

        it('returns 403 requiring a step-up', () => {
          expect(response.status).toHaveBeenCalledWith(403);
          expect(response.json).toHaveBeenCalledWith({
            error: 'step_up_required'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
          expect(testUser.save).not.toHaveBeenCalled();
          expect(testUser.password).toBe(OLD_PASSWORD);
        });
        it('does not send a confirmation email to the user', () => {
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when given a new email with no current password and no recent step-up', () => {
        beforeEach(async () => {
          requestBody = { ...minimumValidRequest, email: NEW_EMAIL };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 403 requiring a step-up', () => {
          expect(response.status).toHaveBeenCalledWith(403);
          expect(response.json).toHaveBeenCalledWith({
            error: 'step_up_required'
          });
        });

        it('does not change the email and sends no email', () => {
          expect(saveUser).not.toHaveBeenCalled();
          expect(testUser.save).not.toHaveBeenCalled();
          expect(testUser.email).toBe(OLD_EMAIL);
          expect(mailerService.send).not.toHaveBeenCalled();
        });
      });

      describe('when a user without a password requests changes without a recent step-up', () => {
        beforeEach(async () => {
          testUser.password = undefined;
          requestBody = {
            ...minimumValidRequest,
            email: NEW_EMAIL,
            // currentPassword cannot substitute for step-up without a password
            currentPassword: 'anything',
            newPassword: NEW_PASSWORD
          };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 403 requiring a step-up', () => {
          expect(response.status).toHaveBeenCalledWith(403);
          expect(response.json).toHaveBeenCalledWith({
            error: 'step_up_required'
          });
        });

        it('does not save anything', () => {
          expect(saveUser).not.toHaveBeenCalled();
          expect(testUser.save).not.toHaveBeenCalled();
          expect(testUser.password).toBeUndefined();
          expect(testUser.email).toBe(OLD_EMAIL);
        });
      });

      describe('when the step-up is stale', () => {
        beforeEach(async () => {
          // 10-minute window elapsed
          (request as any).session = {
            stepUpAt: fixedTime - 10 * 60 * 1000
          };
          requestBody = { ...minimumValidRequest, email: NEW_EMAIL };
          request.setBody(requestBody);
          await updateSettings(
            (request as unknown) as Request,
            (response as unknown) as Response,
            next
          );
        });

        it('returns 403 requiring a step-up', () => {
          expect(response.status).toHaveBeenCalledWith(403);
          expect(response.json).toHaveBeenCalledWith({
            error: 'step_up_required'
          });
        });
      });
    });
  });

  describe('and when there is any other error', () => {
    beforeEach(async () => {
      User.findById = jest.fn().mockRejectedValue('Internal server error');
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
      expect(response.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});
