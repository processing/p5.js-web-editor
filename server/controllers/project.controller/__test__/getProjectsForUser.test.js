/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';

import User from '../../../models/user';
import getProjectsForUser, {
  apiGetProjectsForUser
} from '../../project.controller/getProjectsForUser';

jest.mock('../../../models/user');
jest.mock('../../aws.controller');

describe('project.controller', () => {
  beforeEach(() => {
    User.findByUsername = jest.fn();
  });

  describe('getProjectsForUser()', () => {
    it('returns validation error if username not provided', (done) => {
      const request = new Request();
      request.setParams({});
      const response = new Response();

      const promise = getProjectsForUser(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(422);
        expect(response.json).toHaveBeenCalledWith({
          message: 'Username not provided'
        });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('returns 404 if user does not exist', async () => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      await User.findByUsername.mockResolvedValue(null);

      await getProjectsForUser(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        message: 'User with that username does not exist.'
      });
    });

    it('returns 500 on other errors', async () => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      await User.findByUsername.mockRejectedValue(new Error());

      await getProjectsForUser(request, response);

      expect(response.json).toHaveBeenCalledWith({
        message: 'Error fetching projects'
      });
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });

  describe('apiGetProjectsForUser()', () => {
    it('returns validation error if username not provided', async () => {
      const request = new Request();
      request.setParams({});
      const response = new Response();

      await apiGetProjectsForUser(request, response);

      expect(response.status).toHaveBeenCalledWith(422);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Username not provided'
      });
    });

    it('returns 404 if user does not exist', async () => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      await User.findByUsername.mockResolvedValue(null);

      await apiGetProjectsForUser(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        message: 'User with that username does not exist.'
      });
    });

    it('returns 500 on other errors', async () => {
      const request = new Request();
      request.setParams({ username: 'abc123' });
      const response = new Response();

      await User.findByUsername.mockRejectedValue(new Error());

      await apiGetProjectsForUser(request, response);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Error fetching projects'
      });
    });
  });
});
