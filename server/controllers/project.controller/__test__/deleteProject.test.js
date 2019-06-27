/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';

import Project, { createMock, createInstanceMock } from '../../../models/project';
import User from '../../../models/user';
import deleteProject from '../../project.controller/deleteProject';
import { deleteObjectsFromS3 } from '../../aws.controller';


jest.mock('../../../models/project');
jest.mock('../../aws.controller');

describe('project.controller', () => {
  describe('deleteProject()', () => {
    let ProjectMock;
    let ProjectInstanceMock;

    beforeEach(() => {
      ProjectMock = createMock();
      ProjectInstanceMock = createInstanceMock();
    });

    afterEach(() => {
      ProjectMock.restore();
      ProjectInstanceMock.restore();
    });

    it('returns 403 if project is not owned by authenticated user', (done) => {
      const user = new User();
      const project = new Project();
      project.user = user;

      const request = new Request();
      request.setParams({ project_id: project._id });
      request.user = { _id: 'abc123' };

      const response = new Response();

      ProjectMock
        .expects('findById')
        .resolves(project);

      const promise = deleteProject(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(403);
        expect(response.json).toHaveBeenCalledWith({ success: false, message: 'Authenticated user does not match owner of project' });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('returns 404 if project does not exist', (done) => {
      const user = new User();
      const project = new Project();
      project.user = user;

      const request = new Request();
      request.setParams({ project_id: project._id });
      request.user = { _id: 'abc123' };

      const response = new Response();

      ProjectMock
        .expects('findById')
        .resolves(null);

      const promise = deleteProject(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ success: false, message: 'Project with that id does not exist' });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('deletes project and dependent files from S3 ', (done) => {
      const user = new User();
      const project = new Project();
      project.user = user;

      const request = new Request();
      request.setParams({ project_id: project._id });
      request.user = { _id: user._id };

      const response = new Response();

      ProjectMock
        .expects('findById')
        .resolves(project);

      ProjectInstanceMock.expects('remove')
        .yields();

      const promise = deleteProject(request, response);

      function expectations() {
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({ success: true });
        expect(deleteObjectsFromS3).toHaveBeenCalled();

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });
  });
});
