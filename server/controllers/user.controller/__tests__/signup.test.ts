import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { User } from '../../../models/user';
import {
  createUser,
  duplicateUserCheck,
  verifyEmail,
  emailVerificationInitiate
} from '../signup';

import { mailerService } from '../../../utils/mail';
import { DuplicateUserCheckQuery, VerifyEmailQuery } from '../../../types';
import { createMockUser } from '../__testUtils__';

jest.mock('../../../models/user');
jest.mock('../../../utils/mail');
jest.mock('../../../views/mail');

describe('user.controller > signup', () => {
  let request: MockRequest;
  let response: MockResponse;
  let next: MockNext;

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

  describe('createUser', () => {
    it('should return 422 if email already exists', async () => {
      User.findByEmailAndUsername = jest.fn().mockResolvedValue({
        email: 'existing@example.com',
        username: 'anyusername'
      });

      request.setBody({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password'
      });

      await createUser(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(User.findByEmailAndUsername).toHaveBeenCalledWith(
        'existing@example.com',
        'testuser'
      );
      expect(response.status).toHaveBeenCalledWith(422);
      expect(response.send).toHaveBeenCalledWith({ error: 'Email is in use' });
    });
    it('should return 422 if username already exists', async () => {
      User.findByEmailAndUsername = jest.fn().mockResolvedValue({
        email: 'anyemail@example.com',
        username: 'testuser'
      });

      request.setBody({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password'
      });

      await createUser(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(User.findByEmailAndUsername).toHaveBeenCalledWith(
        'existing@example.com',
        'testuser'
      );
      expect(response.status).toHaveBeenCalledWith(422);
      expect(response.send).toHaveBeenCalledWith({
        error: 'Username is in use'
      });
    });
  });

  describe('duplicateUserCheck', () => {
    it('calls findByEmailOrUsername with the correct params', async () => {
      User.findByEmailOrUsername = jest.fn().mockResolvedValue(null);

      request.query = { check_type: 'email', email: 'test@example.com' };

      await duplicateUserCheck(
        (request as unknown) as Request<{}, {}, {}, DuplicateUserCheckQuery>,
        (response as unknown) as Response,
        next
      );

      expect(User.findByEmailOrUsername).toHaveBeenCalledWith(
        'test@example.com',
        {
          caseInsensitive: true,
          valueType: 'email'
        }
      );
    });

    it('returns the correct response body when no matching user is found', async () => {
      User.findByEmailOrUsername = jest.fn().mockResolvedValue(null);

      request.query = { check_type: 'username', username: 'newuser' };

      await duplicateUserCheck(
        (request as unknown) as Request<{}, {}, {}, DuplicateUserCheckQuery>,
        (response as unknown) as Response,
        next
      );

      expect(response.json).toHaveBeenCalledWith({
        exists: false,
        type: 'username'
      });
    });

    it('returns the correct response body when the username already exists', async () => {
      User.findByEmailOrUsername = jest.fn().mockResolvedValue({
        username: 'existinguser'
      });

      request.query = { check_type: 'username', username: 'existinguser' };

      await duplicateUserCheck(
        (request as unknown) as Request<{}, {}, {}, DuplicateUserCheckQuery>,
        (response as unknown) as Response,
        next
      );

      expect(response.json).toHaveBeenCalledWith({
        exists: true,
        message: 'This username is already taken.',
        type: 'username'
      });
    });

    it('returns the correct response body when the email already exists', async () => {
      User.findByEmailOrUsername = jest.fn().mockResolvedValue({
        email: 'existing@example.com'
      });

      request.query = { check_type: 'email', email: 'existing@example.com' };

      await duplicateUserCheck(
        (request as unknown) as Request<{}, {}, {}, DuplicateUserCheckQuery>,
        (response as unknown) as Response,
        next
      );

      expect(response.json).toHaveBeenCalledWith({
        exists: true,
        message: 'This email is already taken.',
        type: 'email'
      });
    });
  });

  describe('verifyEmail', () => {
    it('returns 401 if token is invalid or expired', async () => {
      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      request.query = { t: 'invalidtoken' };

      await verifyEmail(
        (request as unknown) as Request<{}, {}, {}, VerifyEmailQuery>,
        (response as unknown) as Response,
        next
      );

      expect(User.findOne).toHaveBeenCalledWith({
        verifiedToken: 'invalidtoken',
        verifiedTokenExpires: { $gt: expect.any(Date) }
      });
      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is invalid or has expired.'
      });
    });

    it('verifies the user and returns success if token is valid', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      const mockUser = {
        save: saveMock,
        verified: 'verified',
        verifiedToken: 'validtoken',
        verifiedTokenExpires: new Date(Date.now() + 10000)
      };

      User.EmailConfirmation = jest.fn().mockReturnValue({
        Verified: 'verified'
      });

      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      });

      request.query = { t: 'validtoken' };

      await verifyEmail(
        (request as unknown) as Request<{}, {}, {}, VerifyEmailQuery>,
        (response as unknown) as Response,
        next
      );

      expect(mockUser.verified).toBe('verified');
      expect(mockUser.verifiedToken).toBeNull();
      expect(mockUser.verifiedTokenExpires).toBeNull();
      expect(saveMock).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('emailVerificationInitiate', () => {
    it('returns 404 if user is not found', async () => {
      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      request.user = createMockUser({ id: 'nonexistentid' });
      request.headers.host = 'localhost:3000';

      await emailVerificationInitiate(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(User.findById).toHaveBeenCalledWith('nonexistentid');
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('returns 409 if user is already verified', async () => {
      User.EmailConfirmation = jest.fn().mockReturnValue({
        Verified: 'verified'
      });

      const mockUser = {
        verified: 'verified'
      };
      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      request.user = createMockUser({ id: 'user1' });
      request.headers.host = 'localhost:3000';

      await emailVerificationInitiate(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(409);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Email already verified'
      });
    });

    it('sends a new verification email and updates the user', async () => {
      User.EmailConfirmation = jest.fn().mockReturnValue({
        Resent: 'resent'
      });

      const saveMock = jest.fn().mockResolvedValue({});
      const mockUser = {
        verified: 'sent',
        verifiedToken: null,
        verifiedTokenExpires: null,
        email: 'test@example.com',
        save: saveMock
      };

      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      request.user = createMockUser({ id: 'user1' });
      request.headers.host = 'localhost:3000';

      await emailVerificationInitiate(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(mailerService.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Mock confirm your email' }) // see views/__mocks__/mail.ts
      );
      expect(mockUser.verified).toBe('resent');
      expect(mockUser.verifiedToken).toBeDefined();
      expect(mockUser.verifiedTokenExpires).toBeDefined();
      expect(saveMock).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: request.user.email,
          username: request.user.username
        })
      );
    });

    it('returns 500 if mailer fails', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      const mockUser = {
        verified: 'sent',
        verifiedToken: null,
        verifiedTokenExpires: null,
        email: 'test@example.com',
        save: saveMock
      };

      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      mailerService.send = jest
        .fn()
        .mockRejectedValue(new Error('Mailer fail'));

      request.user = createMockUser({ id: 'user1' });
      request.headers.host = 'localhost:3000';

      await emailVerificationInitiate(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.send).toHaveBeenCalledWith({
        error: 'Error sending mail'
      });
    });
  });
});
