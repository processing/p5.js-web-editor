import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import passport from 'passport';
import {
  createSession,
  getSession,
  destroySession
} from '../session.controller';
import { userResponse } from '../user.controller';

jest.mock('passport', () => ({
  authenticate: jest.fn()
}));

jest.mock('../user.controller', () => ({
  userResponse: jest.fn((user) => ({ id: user.id, username: user.username }))
}));

describe('session.controller', () => {
  let request: MockRequest;
  let response: MockResponse;
  let next: MockNext;

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();

    // Add missing properties that jest-express MockRequest doesn't have by default but Passport uses
    (request as any).logIn = jest.fn();
    (request as any).logout = jest.fn();
    (request as any).session = {
      destroy: jest.fn()
    } as any;
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('calls next with error if passport authentication fails', () => {
      const error = new Error('Auth failed');
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => (mockReq: any, mockRes: any, mockNext: any) =>
          callback(error, null)
      );

      createSession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('returns 401 if user is not found', () => {
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => (mockReq: any, mockRes: any, mockNext: any) =>
          callback(null, false)
      );

      createSession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Invalid username or password.'
      });
    });

    it('calls next with error if req.logIn fails', () => {
      const user = { id: '1', username: 'test' };
      const loginError = new Error('Login failed');

      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => (mockReq: any, mockRes: any, mockNext: any) =>
          callback(null, user)
      );

      ((request as any)
        .logIn as jest.Mock).mockImplementation(
        (mockUser: any, callback: any) => callback(loginError)
      );

      createSession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(loginError);
    });

    it('returns user data on successful login', () => {
      const user = { id: '1', username: 'test' };

      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => (mockReq: any, mockRes: any, mockNext: any) =>
          callback(null, user)
      );

      ((request as any).logIn as jest.Mock).mockImplementation(
        (mockUser: any, callback: any) => {
          request.user = user as any;
          callback(null);
        }
      );

      createSession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.json).toHaveBeenCalledWith({ id: '1', username: 'test' });
    });
  });

  describe('getSession', () => {
    it('returns null user if not authenticated', () => {
      getSession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.send).toHaveBeenCalledWith({ user: null });
    });

    it('returns 403 if user is banned', () => {
      request.user = { banned: true } as any;

      getSession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Forbidden: User is banned.'
      });
    });

    it('returns user data if authenticated and not banned', () => {
      request.user = { id: '1', username: 'test', banned: false } as any;

      getSession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.json).toHaveBeenCalledWith({ id: '1', username: 'test' });
    });
  });

  describe('destroySession', () => {
    it('calls next with error if logout fails', () => {
      const logoutError = new Error('Logout failed');
      ((request as any)
        .logout as jest.Mock).mockImplementation((callback: any) =>
        callback(logoutError)
      );

      destroySession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(logoutError);
    });

    it('calls next with error if session destruction fails', () => {
      const destroyError = new Error('Destroy failed');
      ((request as any)
        .logout as jest.Mock).mockImplementation((callback: any) =>
        callback(null)
      );
      ((request as any).session
        .destroy as jest.Mock).mockImplementation((callback: any) =>
        callback(destroyError)
      );

      destroySession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(destroyError);
    });

    it('returns success true if logout and session destruction succeed', () => {
      ((request as any)
        .logout as jest.Mock).mockImplementation((callback: any) =>
        callback(null)
      );
      ((request as any).session
        .destroy as jest.Mock).mockImplementation((callback: any) =>
        callback(null)
      );

      destroySession(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
