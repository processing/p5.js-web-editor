import { last } from 'lodash';
import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { User } from '../../../models/user';
import { createApiKey, removeApiKey } from '../apiKey';
import type {
  ApiKeyDocument,
  RemoveApiKeyRequestParams,
  UserDocument
} from '../../../types';
import { createMockUser } from '../__testUtils__';

jest.mock('../../../models/user');

describe('user.controller > api key', () => {
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

  describe('createApiKey', () => {
    it("returns an error if user doesn't exist", async () => {
      request.user = createMockUser({ id: '1234' }, true);

      User.findById = jest.fn().mockResolvedValue(null);

      await createApiKey(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('returns an error if label not provided', async () => {
      request.user = createMockUser({ id: '1234' }, true);
      request.body = {};

      const user = new User();
      User.findById = jest.fn().mockResolvedValue(user);

      await createApiKey(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: "Expected field 'label' was not present in request body"
      });
    });

    it('returns generated API key to the user', async () => {
      request.user = createMockUser({ id: '1234' });
      request.setBody({ label: 'my key' });

      const user = new User();
      user.apiKeys = ([] as unknown) as Types.DocumentArray<ApiKeyDocument>;

      User.findById = jest.fn().mockResolvedValue(user);
      user.save = jest.fn();

      await createApiKey(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );

      const lastKey = last(user.apiKeys);

      expect(lastKey?.label).toBe('my key');
      expect(typeof lastKey?.hashedKey).toBe('string');

      const responseData = response.json.mock.calls[0][0];
      expect(responseData.apiKeys.length).toBe(1);
      expect(responseData.apiKeys[0]).toMatchObject({
        label: 'my key',
        token: lastKey?.hashedKey
      });
    });
  });

  describe('removeApiKey', () => {
    it("returns an error if user doesn't exist", async () => {
      request.user = createMockUser({ id: '1234' }, true);

      User.findById = jest.fn().mockResolvedValue(null);

      await removeApiKey(
        (request as unknown) as Request<RemoveApiKeyRequestParams>,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it("returns an error if specified key doesn't exist", async () => {
      request.user = createMockUser({ id: '1234' }, true);
      request.params = { keyId: 'not-a-real-key' };
      const user = new User();
      user.apiKeys = ([] as unknown) as Types.DocumentArray<ApiKeyDocument>;

      User.findById = jest.fn().mockResolvedValue(user);

      await removeApiKey(
        (request as unknown) as Request<RemoveApiKeyRequestParams>,
        (response as unknown) as Response,
        next
      );

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Key does not exist for user'
      });
    });

    it('removes key if it exists', async () => {
      const mockKey1 = { _id: 'id1', id: 'id1', label: 'first key' };
      const mockKey2 = { _id: 'id2', id: 'id2', label: 'second key' };

      const apiKeys = ([
        mockKey1,
        mockKey2
      ] as unknown) as Types.DocumentArray<ApiKeyDocument>;
      apiKeys.find = Array.prototype.find;
      apiKeys.pull = jest.fn();

      const user = createMockUser(
        {
          id: '1234',
          apiKeys,
          save: jest.fn()
        },
        true
      ) as UserDocument;

      request.user = user;
      request.params = { keyId: 'id1' };

      User.findById = jest.fn().mockResolvedValue(user);

      await removeApiKey(
        (request as unknown) as Request<RemoveApiKeyRequestParams>,
        (response as unknown) as Response,
        next
      );

      expect(user.apiKeys.pull).toHaveBeenCalledWith({ _id: 'id1' });
      expect(user.save).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(200);
    });
  });
});
