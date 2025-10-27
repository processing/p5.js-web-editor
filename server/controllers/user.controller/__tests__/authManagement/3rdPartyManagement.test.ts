import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { unlinkGithub, unlinkGoogle } from '../../authManagement';
import { saveUser } from '../../helpers';
import { createMockUser } from '../../__testUtils__';

jest.mock('../../helpers', () => ({
  ...jest.requireActual('../../helpers'),
  saveUser: jest.fn()
}));
jest.mock('../../../../utils/mail');

describe('user.controller > auth management > 3rd party auth', () => {
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

  describe('unlinkGithub', () => {
    describe('and when there is no user in the request', () => {
      beforeEach(async () => {
        await unlinkGithub(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('does not call saveUser', () => {
        expect(saveUser).not.toHaveBeenCalled();
      });
      it('returns a 404 with the correct status and message', () => {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'You must be logged in to complete this action.'
        });
      });
    });
    describe('and when there is a user in the request', () => {
      const user = createMockUser({
        github: 'testuser',
        tokens: [{ kind: 'github' }, { kind: 'google' }]
      });

      beforeEach(async () => {
        request.user = user;
        await unlinkGithub(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('removes the users github property', () => {
        expect(user.github).toBeUndefined();
      });
      it('filters out the github token', () => {
        expect(user.tokens).toEqual([{ kind: 'google' }]);
      });
      it('does calls saveUser', () => {
        expect(saveUser).toHaveBeenCalledWith(response, user);
      });
    });
  });

  describe('unlinkGoogle', () => {
    describe('and when there is no user in the request', () => {
      beforeEach(async () => {
        await unlinkGoogle(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('does not call saveUser', () => {
        expect(saveUser).not.toHaveBeenCalled();
      });
      it('returns a 404 with the correct status and message', () => {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'You must be logged in to complete this action.'
        });
      });
    });
    describe('and when there is a user in the request', () => {
      const user = createMockUser({
        google: 'testuser',
        tokens: [{ kind: 'github' }, { kind: 'google' }]
      });

      beforeEach(async () => {
        request.user = user;
        await unlinkGoogle(
          (request as unknown) as Request,
          (response as unknown) as Response,
          next
        );
      });
      it('removes the users google property', () => {
        expect(user.google).toBeUndefined();
      });
      it('filters out the google token', () => {
        expect(user.tokens).toEqual([{ kind: 'github' }]);
      });
      it('does calls saveUser', () => {
        expect(saveUser).toHaveBeenCalledWith(response, user);
      });
    });
  });
});
