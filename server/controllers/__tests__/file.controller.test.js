import { Request, Response } from 'jest-express';
import mime from 'mime';
import Project from '../../models/project';
import { getFileContent } from '../file.controller';
import { resolvePathToFile } from '../../utils/filePath';

jest.mock('../../models/project');
jest.mock('../../utils/filePath');
jest.mock('mime');

describe('file.controller > getFileContent', () => {
  let request;
  let response;

  beforeEach(() => {
    request = new Request();
    response = new Response();
    response.send = jest.fn();
    response.status = jest.fn().mockReturnThis();
    response.set = jest.fn().mockReturnThis();
    request.setParams({ project_id: 'project-123', 0: 'sketch.js' });
    Project.findOne = jest.fn();
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  function mockProject(project) {
    Project.findOne.mockResolvedValue(project);
  }

  it('returns 403 for an unauthenticated request to a private project', async () => {
    const project = {
      visibility: 'Private',
      user: { equals: jest.fn() },
      files: []
    };
    mockProject(project);

    await getFileContent(request, response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Project is private'
    });
    expect(resolvePathToFile).not.toHaveBeenCalled();
  });

  it('returns 403 for a non-owner request to a private project', async () => {
    const project = {
      visibility: 'Private',
      user: { equals: jest.fn().mockReturnValue(false) },
      files: []
    };
    request.user = { _id: 'other-user-id' };
    mockProject(project);

    await getFileContent(request, response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Project is private'
    });
    expect(project.user.equals).toHaveBeenCalledWith('other-user-id');
    expect(resolvePathToFile).not.toHaveBeenCalled();
  });

  it('returns a private project file to its owner', async () => {
    const project = {
      visibility: 'Private',
      user: { equals: jest.fn().mockReturnValue(true) },
      files: []
    };
    const resolvedFile = {
      name: 'sketch.js',
      content: 'sketch content'
    };
    request.user = { _id: 'owner-user-id' };
    mockProject(project);
    resolvePathToFile.mockReturnValue(resolvedFile);
    mime.getType.mockReturnValue('application/javascript');

    await getFileContent(request, response);

    expect(resolvePathToFile).toHaveBeenCalledWith('sketch.js', project.files);
    expect(response.set).toHaveBeenCalledWith(
      'Content-Type',
      'application/javascript'
    );
    expect(response.send).toHaveBeenCalledWith('sketch content');
  });

  it('returns a public project file to an unauthenticated user', async () => {
    const project = {
      visibility: 'Public',
      user: { equals: jest.fn() },
      files: []
    };
    const resolvedFile = {
      name: 'sketch.js',
      content: 'sketch content'
    };
    mockProject(project);
    resolvePathToFile.mockReturnValue(resolvedFile);
    mime.getType.mockReturnValue('application/javascript');

    await getFileContent(request, response);

    expect(resolvePathToFile).toHaveBeenCalledWith('sketch.js', project.files);
    expect(response.set).toHaveBeenCalledWith(
      'Content-Type',
      'application/javascript'
    );
    expect(response.send).toHaveBeenCalledWith('sketch content');
  });
});
