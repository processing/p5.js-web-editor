/* @jest-environment node */

import { createApiKey, removeApiKey } from '../../user.controller/apiKey';

jest.mock('../../../models/user');

const createResponseMock = function (done) {
  const json = jest.fn(() => {
    if (done) { done(); }
  });
  const status = jest.fn(() => ({ json }));

  return {
    status,
    json
  };
};

const User = require('../../../models/user').default;

describe('user.controller', () => {
  beforeEach(() => {
    User.__setFindById(null, null);
  });

  describe('createApiKey', () => {
    it('returns an error if user doesn\'t exist', () => {
      const request = { user: { id: '1234' } };
      const response = createResponseMock();

      createApiKey(request, response);

      expect(User.findById.mock.calls[0][0]).toBe('1234');
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('returns an error if label not provided', () => {
      User.__setFindById(undefined, {
        apiKeys: []
      });
      const request = { user: { id: '1234' }, body: {} };
      const response = createResponseMock();

      createApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Expected field \'label\' was not present in request body'
      });
    });

    it('returns generated API key to the user', (done) => {
      let response;

      const request = {
        user: { id: '1234' },
        body: { label: 'my key' }
      };

      const foundUser = {
        apiKeys: [],
        save: jest.fn(callback => callback())
      };

      const checkExpecations = () => {
        expect(foundUser.apiKeys[0].label).toBe('my key');
        expect(typeof foundUser.apiKeys[0].hashedKey).toBe('string');

        expect(response.json).toHaveBeenCalledWith({
          token: foundUser.apiKeys[0].hashedKey
        });

        done();
      };

      response = createResponseMock(checkExpecations);

      User.__setFindById(undefined, foundUser);

      createApiKey(request, response);
    });
  });

  describe('removeApiKey', () => {
    it('returns an error if user doesn\'t exist', () => {
      const request = { user: { id: '1234' } };
      const response = createResponseMock();

      removeApiKey(request, response);

      expect(User.findById.mock.calls[0][0]).toBe('1234');
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('returns an error if specified key doesn\'t exist', () => {
      const request = {
        user: { id: '1234' },
        params: { keyId: 'not-a-real-key' }
      };
      const response = createResponseMock();

      const foundUser = {
        apiKeys: [],
        save: jest.fn(callback => callback())
      };
      User.__setFindById(undefined, foundUser);

      removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Key does not exist for user'
      });
    });

    it.skip('removes key if it exists', () => {
      const request = {
        user: { id: '1234' },
        params: { keyId: 'the-key' }
      };
      const response = createResponseMock();

      const foundUser = {
        apiKeys: [{ label: 'the-label', id: 'the-key' }],
        save: jest.fn(callback => callback())
      };
      User.__setFindById(undefined, foundUser);

      removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Key does not exist for user'
      });
    });
  });
});
