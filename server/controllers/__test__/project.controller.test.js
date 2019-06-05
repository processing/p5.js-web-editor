/**
 * @jest-environment node
 */
import { Response } from 'jest-express';

// import Project from '../../models/project';
import createProject from '../project.controller/createProject';

jest.mock('../../models/project');

describe('project.controller', () => {
  describe('createProject()', () => {
    const { ProjectMock } = require('../../models/project');

    beforeEach(() => {
      ProjectMock.reset();
    });

    it('fails if create fails', (done) => {
      ProjectMock.toReturn(new Error('An error'), 'save');

      const request = { user: {} };
      const response = new Response();

      const promise = createProject(request, response);

      function expectations() {
        expect(response.json).toHaveBeenCalledWith({ success: false });
        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('saves referenced user on project creation', (done) => {
      const request = { user: {} };
      const response = new Response();

      ProjectMock.toReturn({ _id: 'abc123', name: 'Project name' }, 'save');

      const promise = createProject(request, response);

      function expectations() {
        const doc = response.json.mock.calls[0][0];

        expect(response.json).toHaveBeenCalled();

        expect(JSON.parse(JSON.stringify(doc))).toMatchObject({
          _id: 'abc123',
          id: 'abc123',
          name: 'Project name',
          serveSecure: false,
          files: []
        });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });
  });
});
