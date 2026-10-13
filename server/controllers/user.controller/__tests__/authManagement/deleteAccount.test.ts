import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../../../models/user';
import Project from '../../../../models/project';
import Collection from '../../../../models/collection';
import { deleteAccount } from '../../authManagement';
import { deleteAllObjectsForUser } from '../../../aws.controller';
import { createMockUser } from '../../__testUtils__';
import { UserDocument } from '../../../../types';

const mockObjectId = new Types.ObjectId('507f1f77bcf86cd799439011');

jest.mock('../../../../models/user');
jest.mock('../../../../models/project', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    deleteMany: jest.fn()
  }
}));
jest.mock('../../../../models/collection', () => ({
  __esModule: true,
  default: {
    deleteMany: jest.fn()
  }
}));
jest.mock('../../../../utils/mail');
jest.mock('../../../../views/mail');
jest.mock('../../../aws.controller', () => ({
  deleteAllObjectsForUser: jest.fn().mockResolvedValue(undefined)
}));

describe('user.controller > auth management > deleteAccount', () => {
  let request: MockRequest;
  let response: MockResponse;
  let next: MockNext;

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();
    (Project.find as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue([])
    });
    (Project.deleteMany as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null)
    });
    (Collection.deleteMany as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null)
    });
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  describe('when the user is not found', () => {
    beforeEach(async () => {
      request.user = createMockUser({ id: 'nonexistent' }, true);
      User.findById = jest.fn().mockResolvedValue(null);
      await deleteAccount(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
    });
    it('returns 404', () => {
      expect(response.status).toHaveBeenCalledWith(404);
    });
    it('returns the correct message', () => {
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found.'
      });
    });
  });

  describe('when the user has a password', () => {
    let mockUser: UserDocument;

    beforeEach(() => {
      mockUser = createMockUser(
        {
          _id: mockObjectId,
          password: 'hashed',
          github: undefined,
          google: undefined,
          tokens: [],
          comparePassword: jest.fn(),
          deleteOne: jest.fn().mockResolvedValue(null)
        },
        true
      ) as UserDocument;
      User.findById = jest.fn().mockResolvedValue(mockUser);
    });

    describe('and no password is supplied', () => {
      beforeEach(async () => {
        request.user = mockUser;
        request.body = {};
        await deleteAccount(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('returns 401', () => {
        expect(response.status).toHaveBeenCalledWith(401);
      });
      it('returns the correct message', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'Password is required.'
        });
      });
    });

    describe('and an incorrect password is supplied', () => {
      beforeEach(async () => {
        (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);
        request.user = mockUser;
        request.body = { password: 'wrongpassword' };
        await deleteAccount(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('returns 401', () => {
        expect(response.status).toHaveBeenCalledWith(401);
      });
      it('returns the correct message', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'Invalid password.'
        });
      });
    });

    describe('and the correct password is supplied', () => {
      beforeEach(async () => {
        (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
        request.user = mockUser;
        request.body = { password: 'correctpassword' };
        (request as any).logout = jest.fn((cb: (err: null) => void) =>
          cb(null)
        );
        (request as any).session = {
          destroy: jest.fn((cb) => cb && cb())
        };
        await deleteAccount(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('deletes all S3 assets for the user', () => {
        expect(deleteAllObjectsForUser).toHaveBeenCalledWith(
          mockObjectId.toString()
        );
      });
      it('deletes the users projects', () => {
        expect(Project.deleteMany).toHaveBeenCalledWith({ user: mockObjectId });
      });
      it('deletes the users collections', () => {
        expect(Collection.deleteMany).toHaveBeenCalledWith({
          owner: mockObjectId
        });
      });
      it('deletes the user document', () => {
        expect(mockUser.deleteOne).toHaveBeenCalled();
      });
      it('calls req.logout', () => {
        expect((request as any).logout).toHaveBeenCalled();
      });
      it('returns success', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message: 'Account successfully deleted.'
        });
      });
    });

    describe('and the correct password is supplied but S3 deletion fails', () => {
      beforeEach(async () => {
        (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
        (deleteAllObjectsForUser as jest.Mock).mockRejectedValue(
          new Error('S3 network error')
        );
        request.user = mockUser;
        request.body = { password: 'correctpassword' };
        (request as any).logout = jest.fn((cb: (err: null) => void) =>
          cb(null)
        );
        (request as any).session = {
          destroy: jest.fn((cb) => cb && cb())
        };
        await deleteAccount(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('still deletes the users projects', () => {
        expect(Project.deleteMany).toHaveBeenCalledWith({ user: mockObjectId });
      });
      it('still deletes the users collections', () => {
        expect(Collection.deleteMany).toHaveBeenCalledWith({
          owner: mockObjectId
        });
      });
      it('still deletes the user document', () => {
        expect(mockUser.deleteOne).toHaveBeenCalled();
      });
      it('still returns success', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message: 'Account successfully deleted.'
        });
      });
    });
  });

  describe('when the user has only social logins (no password)', () => {
    let mockUser: UserDocument;

    beforeEach(async () => {
      mockUser = createMockUser(
        {
          _id: mockObjectId,
          password: undefined,
          github: 'githubuser',
          google: 'googleuser',
          tokens: [{ kind: 'github' }, { kind: 'google' }],
          deleteOne: jest.fn().mockResolvedValue(null)
        },
        true
      ) as UserDocument;
      User.findById = jest.fn().mockResolvedValue(mockUser);
      request.user = mockUser;
      request.body = {};
      (request as any).logout = jest.fn((cb: (err: null) => void) => cb(null));
      (request as any).session = {
        destroy: jest.fn((cb) => cb && cb())
      };
      await deleteAccount(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
    });

    it('clears the github property', () => {
      expect(mockUser.github).toBeUndefined();
    });
    it('clears the google property', () => {
      expect(mockUser.google).toBeUndefined();
    });
    it('filters out all social tokens', () => {
      expect(mockUser.tokens).toEqual([]);
    });
    it('deletes all S3 assets for the user', () => {
      expect(deleteAllObjectsForUser).toHaveBeenCalledWith(
        mockObjectId.toString()
      );
    });
    it('deletes the user document without requiring a password', () => {
      expect(mockUser.deleteOne).toHaveBeenCalled();
    });
    it('calls req.logout', () => {
      expect((request as any).logout).toHaveBeenCalled();
    });
    it('returns success', () => {
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account successfully deleted.'
      });
    });
  });

  describe('when the user has both a password and social logins', () => {
    let mockUser: UserDocument;

    beforeEach(async () => {
      mockUser = createMockUser(
        {
          _id: mockObjectId,
          password: 'hashed',
          github: 'githubuser',
          google: 'googleuser',
          tokens: [{ kind: 'github' }, { kind: 'google' }],
          comparePassword: jest.fn().mockResolvedValue(true),
          deleteOne: jest.fn().mockResolvedValue(null)
        },
        true
      ) as UserDocument;
      User.findById = jest.fn().mockResolvedValue(mockUser);
      request.user = mockUser;
      request.body = { password: 'correctpassword' };
      (request as any).logout = jest.fn((cb: (err: null) => void) => cb(null));
      (request as any).session = {
        destroy: jest.fn((cb) => cb && cb())
      };
      await deleteAccount(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
    });

    it('clears the github property', () => {
      expect(mockUser.github).toBeUndefined();
    });
    it('clears the google property', () => {
      expect(mockUser.google).toBeUndefined();
    });
    it('filters out all social tokens', () => {
      expect(mockUser.tokens).toEqual([]);
    });
    it('deletes all S3 assets for the user', () => {
      expect(deleteAllObjectsForUser).toHaveBeenCalledWith(
        mockObjectId.toString()
      );
    });
    it('deletes the users projects', () => {
      expect(Project.deleteMany).toHaveBeenCalledWith({ user: mockObjectId });
    });
    it('deletes the users collections', () => {
      expect(Collection.deleteMany).toHaveBeenCalledWith({
        owner: mockObjectId
      });
    });
    it('deletes the user document', () => {
      expect(mockUser.deleteOne).toHaveBeenCalled();
    });
    it('calls req.logout', () => {
      expect((request as any).logout).toHaveBeenCalled();
    });
    it('returns success', () => {
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account successfully deleted.'
      });
    });
  });

  describe('when a database error occurs during deletion', () => {
    let mockUserWithDbError: UserDocument;

    beforeEach(async () => {
      mockUserWithDbError = createMockUser(
        {
          _id: mockObjectId,
          password: 'hashed',
          github: undefined,
          google: undefined,
          tokens: [],
          comparePassword: jest.fn().mockResolvedValue(true),
          deleteOne: jest.fn().mockRejectedValue(new Error('DB write error'))
        },
        true
      ) as UserDocument;
      User.findById = jest.fn().mockResolvedValue(mockUserWithDbError);
      request.user = mockUserWithDbError;
      request.body = { password: 'correctpassword' };
      (request as any).logout = jest.fn((cb: (err: null) => void) => cb(null));
      (request as any).session = {
        destroy: jest.fn((cb) => cb && cb())
      };
      await deleteAccount(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
    });

    it('returns 500', () => {
      expect(response.status).toHaveBeenCalledWith(500);
    });
    it('returns the correct error message', () => {
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error.'
      });
    });
  });
});
