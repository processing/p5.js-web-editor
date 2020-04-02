/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';

import { createMock } from '../../../models/user';
import getProjectsForUser, { apiGetProjectsForUser } from '../../project.controller/getProjectsForUser';

jest.mock('../../../models/user');
jest.mock('../../aws.controller');

describe('project.controller', () => {
  let UserMock;

  beforeEach(() => {
    UserMock = createMock();
  });

  afterEach(() => {
    UserMock.restore();
  });

  describe('getProjectsForUser()', () => {
    it('returns empty array user not supplied as parameter', (done) => {
      const request = new Request();
      request.setParams({});
      const response = new Response();

      const promise = getProjectsForUser(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith([]);

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('returns 404 if user does not exist', (done) => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      UserMock
        .expects('findOne')
        .withArgs({ username: 'abc123' })
        .yields(null, null);

      const promise = getProjectsForUser(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ message: 'User with that username does not exist.' });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('returns 500 on other errors', (done) => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      UserMock
        .expects('findOne')
        .withArgs({ username: 'abc123' })
        .yields(new Error(), null);

      const promise = getProjectsForUser(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ message: 'Error fetching projects' });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });
  });

  describe('apiGetProjectsForUser()', () => {
    it('returns validation error if user id not provided', (done) => {
      const request = new Request();
      request.setParams({});
      const response = new Response();

      const promise = apiGetProjectsForUser(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(422);
        expect(response.json).toHaveBeenCalledWith({
          message: 'Username not provided'
        });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });


    it('returns 404 if user does not exist', (done) => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      UserMock
        .expects('findOne')
        .withArgs({ username: 'abc123' })
        .yields(null, null);

      const promise = apiGetProjectsForUser(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ message: 'User with that username does not exist.' });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('returns 500 on other errors', (done) => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      UserMock
        .expects('findOne')
        .withArgs({ username: 'abc123' })
        .yields(new Error(), null);

      const promise = apiGetProjectsForUser(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ message: 'Error fetching projects' });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });
  });
});
