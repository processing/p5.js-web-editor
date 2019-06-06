/**
 * @jest-environment node
 */
import { Response } from 'jest-express';

import { createMock } from '../../models/project';
import createProject from '../project.controller/createProject';

jest.mock('../../models/project');

describe('project.controller', () => {
  describe('createProject()', () => {
    let ProjectMock;

    beforeEach(() => {
      ProjectMock = createMock();
    });

    afterEach(() => {
      ProjectMock.restore();
    });

    it('fails if create fails', (done) => {
      const error = new Error('An error');

      ProjectMock
        .expects('create')
        .rejects(error);

      const request = { user: {} };
      const response = new Response();

      const promise = createProject(request, response);

      function expectations() {
        expect(response.json).toHaveBeenCalledWith({ success: false });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('extracts parameters from request body', (done) => {
      const request = {
        user: { _id: 'abc123' },
        body: { name: 'Wriggly worm' }
      };
      const response = new Response();


      ProjectMock
        .expects('create')
        .withArgs({ user: 'abc123', name: 'Wriggly worm' })
        .resolves();

      const promise = createProject(request, response);

      function expectations() {
        expect(response.json).toHaveBeenCalled();

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    // TODO: This should be extracted to a new model object
    //       so the controllers just have to call a single
    //       method for this operation
    it('populates referenced user on project creation', (done) => {
      const request = { user: { _id: 'abc123' } };
      const response = new Response();

      const result = {
        _id: 'abc123',
        id: 'abc123',
        name: 'Project name',
        serveSecure: false,
        files: []
      };

      const resultWithUser = {
        ...result,
        user: {}
      };

      ProjectMock
        .expects('create')
        .withArgs({ user: 'abc123' })
        .resolves(result);

      ProjectMock
        .expects('populate')
        .withArgs(result)
        .yields(null, resultWithUser)
        .resolves(resultWithUser);

      const promise = createProject(request, response);

      function expectations() {
        const doc = response.json.mock.calls[0][0];

        expect(response.json).toHaveBeenCalled();

        expect(JSON.parse(JSON.stringify(doc))).toMatchObject(resultWithUser);

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('fails if referenced user population fails', (done) => {
      const request = { user: { _id: 'abc123' } };
      const response = new Response();

      const result = {
        _id: 'abc123',
        id: 'abc123',
        name: 'Project name',
        serveSecure: false,
        files: []
      };

      const error = new Error('An error');

      ProjectMock
        .expects('create')
        .resolves(result);

      ProjectMock
        .expects('populate')
        .yields(error)
        .resolves(error);

      const promise = createProject(request, response);

      function expectations() {
        expect(response.json).toHaveBeenCalledWith({ success: false });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });
  });
});
