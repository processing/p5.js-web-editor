/* @jest-environment node */

import last from 'lodash/last';
import { createApiKey, removeApiKey } from '../../user.controller/apiKey';

jest.mock('../../../models/user');

/*
  Create a mock object representing an express Response
*/
const createResponseMock = function createResponseMock(done) {
  const json = jest.fn(() => {
    if (done) { done(); }
  });

  const status = jest.fn(() => ({ json }));

  return {
    status,
    json
  };
};

/*
  Create a mock of the mongoose User model
*/
const createUserMock = function createUserMock() {
  const apiKeys = [];
  let nextId = 0;

  apiKeys.push = ({ label, hashedKey }) => {
    const id = nextId;
    nextId += 1;
    const publicFields = { id, label };
    const allFields = { ...publicFields, hashedKey };

    Object.defineProperty(allFields, 'toObject', {
      value: () => publicFields,
      enumerable: false
    });

    return Array.prototype.push.call(apiKeys, allFields);
  };

  apiKeys.pull = ({ _id }) => {
    const index = apiKeys.findIndex(({ id }) => id === _id);
    return apiKeys.splice(index, 1);
  };

  return {
    apiKeys,
    save: jest.fn(callback => callback())
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
      User.__setFindById(undefined, createUserMock());

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

      const user = createUserMock();

      const checkExpecations = () => {
        const lastKey = last(user.apiKeys);

        expect(lastKey.label).toBe('my key');
        expect(typeof lastKey.hashedKey).toBe('string');

        expect(response.json).toHaveBeenCalledWith({
          apiKeys: [
            { id: 0, label: 'my key', token: lastKey.hashedKey }
          ]
        });

        done();
      };

      response = createResponseMock(checkExpecations);

      User.__setFindById(undefined, user);

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

      const user = createUserMock();
      User.__setFindById(undefined, user);

      removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Key does not exist for user'
      });
    });

    it.skip('removes key if it exists', () => {
      const request = {
        user: { id: '1234' },
        params: { keyId: 0 }
      };
      const response = createResponseMock();

      const user = createUserMock();

      user.apiKeys.push({ label: 'first key' }); // id 0
      user.apiKeys.push({ label: 'second key' }); // id 1

      User.__setFindById(undefined, user);

      removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        apiKeys: [
          { id: 1, label: 'second key' }
        ]
      });
    });
  });
});
