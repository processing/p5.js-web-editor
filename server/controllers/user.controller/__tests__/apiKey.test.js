/* @jest-environment node */

import { last } from 'lodash';
import { Request, Response } from 'jest-express';

import { User } from '../../../models/user';
import { createApiKey, removeApiKey } from '../apiKey';

jest.mock('../../../models/user');

describe('user.controller', () => {
  let request;
  let response;

  beforeEach(() => {
    request = new Request();
    response = new Response();
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  describe('createApiKey', () => {
    it("returns an error if user doesn't exist", async () => {
      request.user = { id: '1234' };
      response = new Response();

      User.findById = jest.fn().mockResolvedValue(null);

      await createApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('returns an error if label not provided', async () => {
      request.user = { id: '1234' };
      request.body = {};

      const user = new User();
      User.findById = jest.fn().mockResolvedValue(user);

      await createApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: "Expected field 'label' was not present in request body"
      });
    });

    it('returns generated API key to the user', async () => {
      request.setBody({ label: 'my key' });
      request.user = { id: '1234' };

      const user = new User();
      user.apiKeys = [];

      User.findById = jest.fn().mockResolvedValue(user);
      user.save = jest.fn().mockResolvedValue();

      await createApiKey(request, response);

      const lastKey = last(user.apiKeys);

      expect(lastKey.label).toBe('my key');
      expect(typeof lastKey.hashedKey).toBe('string');

      const responseData = response.json.mock.calls[0][0];
      expect(responseData.apiKeys.length).toBe(1);
      expect(responseData.apiKeys[0]).toMatchObject({
        label: 'my key',
        token: lastKey.hashedKey
      });
    });
  });

  describe('removeApiKey', () => {
    it("returns an error if user doesn't exist", async () => {
      request.user = { id: '1234' };
      response = new Response();

      User.findById = jest.fn().mockResolvedValue(null);

      await removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it("returns an error if specified key doesn't exist", async () => {
      request.user = { id: '1234' };
      request.params = { keyId: 'not-a-real-key' };
      const user = new User();
      user.apiKeys = [];

      User.findById = jest.fn().mockResolvedValue(user);

      await removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Key does not exist for user'
      });
    });

    it('removes key if it exists', async () => {
      const mockKey1 = { _id: 'id1', id: 'id1', label: 'first key' };
      const mockKey2 = { _id: 'id2', id: 'id2', label: 'second key' };

      const apiKeys = [mockKey1, mockKey2];
      apiKeys.find = Array.prototype.find;
      apiKeys.pull = jest.fn();

      const user = {
        apiKeys,
        save: jest.fn().mockResolvedValue()
      };

      request.user = { id: '1234' };
      request.params = { keyId: 'id1' };

      User.findById = jest.fn().mockResolvedValue(user);

      await removeApiKey(request, response);

      expect(user.apiKeys.pull).toHaveBeenCalledWith({ _id: 'id1' });
      expect(user.save).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(200);
    });
  });
});
