/* @jest-environment node */

import last from 'lodash/last';
import { Request, Response } from 'jest-express';

import User, { createMock, createInstanceMock } from '../../../models/user';
import { createApiKey, removeApiKey } from '../../user.controller/apiKey';

jest.mock('../../../models/user');

describe('user.controller', () => {
  let UserMock;
  let UserInstanceMock;

  beforeEach(() => {
    UserMock = createMock();
    UserInstanceMock = createInstanceMock();
  });

  afterEach(() => {
    UserMock.restore();
    UserInstanceMock.restore();
  });


  describe('createApiKey', () => {
    it('returns an error if user doesn\'t exist', () => {
      const request = { user: { id: '1234' } };
      const response = new Response();

      UserMock
        .expects('findById')
        .withArgs('1234')
        .yields(null, null);

      createApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('returns an error if label not provided', () => {
      const request = { user: { id: '1234' }, body: {} };
      const response = new Response();

      UserMock
        .expects('findById')
        .withArgs('1234')
        .yields(null, new User());

      createApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Expected field \'label\' was not present in request body'
      });
    });

    it('returns generated API key to the user', (done) => {
      const request = new Request();
      request.setBody({ label: 'my key' });
      request.user = { id: '1234' };

      const response = new Response();

      const user = new User();

      UserMock
        .expects('findById')
        .withArgs('1234')
        .yields(null, user);

      UserInstanceMock.expects('save')
        .yields();

      function expectations() {
        const lastKey = last(user.apiKeys);

        expect(lastKey.label).toBe('my key');
        expect(typeof lastKey.hashedKey).toBe('string');

        const responseData = response.json.mock.calls[0][0];

        expect(responseData.apiKeys.length).toBe(1);
        expect(responseData.apiKeys[0]).toMatchObject({
          label: 'my key',
          token: lastKey.hashedKey,
          lastUsedAt: undefined,
          createdAt: undefined
        });

        done();
      }

      const promise = createApiKey(request, response);

      promise.then(expectations, expectations).catch(expectations);
    });
  });

  describe('removeApiKey', () => {
    it('returns an error if user doesn\'t exist', () => {
      const request = { user: { id: '1234' } };
      const response = new Response();

      UserMock
        .expects('findById')
        .withArgs('1234')
        .yields(null, null);

      removeApiKey(request, response);

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
      const response = new Response();
      const user = new User();

      UserMock
        .expects('findById')
        .withArgs('1234')
        .yields(null, user);

      removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Key does not exist for user'
      });
    });

    it('removes key if it exists', () => {
      const user = new User();
      user.apiKeys.push({ label: 'first key' }); // id 0
      user.apiKeys.push({ label: 'second key' }); // id 1

      const firstKeyId = user.apiKeys[0]._id.toString();
      const secondKeyId = user.apiKeys[1]._id.toString();

      const request = {
        user: { id: '1234' },
        params: { keyId: firstKeyId }
      };
      const response = new Response();

      UserMock
        .expects('findById')
        .withArgs('1234')
        .yields(null, user);

      UserInstanceMock
        .expects('save')
        .yields();

      removeApiKey(request, response);

      expect(response.status).toHaveBeenCalledWith(200);

      const responseData = response.json.mock.calls[0][0];

      expect(responseData.apiKeys.length).toBe(1);
      expect(responseData.apiKeys[0]).toMatchObject({
        id: secondKeyId,
        label: 'second key',
        lastUsedAt: undefined,
        createdAt: undefined
      });
    });
  });
});
