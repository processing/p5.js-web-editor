/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';

import Project from '../../../models/project';
import User from '../../../models/user';
import deleteProject from '../../project.controller/deleteProject';
import { deleteObjectsFromS3 } from '../../aws.controller';

jest.mock('../../../models/project');
jest.mock('../../aws.controller');

// TODO: incomplete test, 500 response status needs to be added

describe('project.controller', () => {
  let request;
  let response;

  beforeEach(() => {
    request = new Request();
    response = new Response();
    Project.findById = jest.fn();
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
  });

  it('returns 403 if project is not owned by authenticated user', async () => {
    const user = new User();
    const project = new Project();
    project.user = user;

    request.setParams({ project_id: project._id });
    request.user = { _id: 'abc123' };

    Project.findById.mockResolvedValue(project);

    await deleteProject(request, response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Authenticated user does not match owner of project'
    });
  });

  it('returns 404 if project does not exist', async () => {
    request.setParams({ project_id: 'random_id' });
    request.user = { _id: 'abc123' };

    Project.findById.mockResolvedValue(null);

    await deleteProject(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Project with that id does not exist'
    });
  });

  it('delete project and dependent files from S3', async () => {
    const user = new User();
    const project = new Project();
    project.user = user;
    project.remove = jest.fn().mockResolvedValue();

    request.setParams({ project_id: project._id });
    request.user = { _id: user._id };

    Project.findById.mockResolvedValue(project);
    deleteObjectsFromS3.mockResolvedValue();

    await deleteProject(request, response);

    expect(deleteObjectsFromS3).toHaveBeenCalled();
    expect(project.remove).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
