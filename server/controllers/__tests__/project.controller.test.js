/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';
import Project from '../../models/project';
import { User } from '../../models/user';
import { getProject, downloadProjectAsZip } from '../project.controller';

jest.mock('../../models/project');
jest.mock('../../models/user');

function createMockProject(overrides = {}) {
  return {
    _id: 'project-123',
    visibility: 'Public',
    user: {
      _id: { equals: jest.fn().mockReturnValue(true) },
      username: 'owner'
    },
    files: [],
    ...overrides
  };
}

describe('project.controller', () => {
  beforeEach(() => {
    User.findByUsername = jest.fn();
  });

  describe('getProject()', () => {
    it('returns 404 if user does not exist', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123', username: 'unknown' });
      const response = new Response();

      User.findByUsername.mockResolvedValue(null);

      await getProject(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.send).toHaveBeenCalledWith({
        message: 'User with that username does not exist'
      });
    });

    it('returns 404 if project does not exist', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123', username: 'owner' });
      const response = new Response();

      User.findByUsername.mockResolvedValue({ _id: 'user-1' });
      Project.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getProject(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project with that id does not exist'
      });
    });

    it('returns 403 if private project is accessed by unauthenticated user', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123', username: 'owner' });
      request.user = undefined;
      const response = new Response();

      const project = createMockProject({ visibility: 'Private' });
      User.findByUsername.mockResolvedValue({ _id: 'user-1' });
      Project.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(project)
      });

      await getProject(request, response);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project is private'
      });
    });

    it('returns 403 if private project is accessed by non-owner', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123', username: 'owner' });
      request.user = { _id: 'other-user-id' };
      const response = new Response();

      const ownerId = { equals: jest.fn().mockReturnValue(false) };
      const project = createMockProject({
        visibility: 'Private',
        user: { _id: ownerId, username: 'owner' }
      });
      User.findByUsername.mockResolvedValue({ _id: 'user-1' });
      Project.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(project)
      });

      await getProject(request, response);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project is private'
      });
      expect(ownerId.equals).toHaveBeenCalledWith('other-user-id');
    });

    it('allows owner to access private project', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123', username: 'owner' });
      request.user = { _id: 'owner-123' };
      const response = new Response();

      const ownerId = { equals: jest.fn().mockReturnValue(true) };
      const project = createMockProject({
        visibility: 'Private',
        user: { _id: ownerId, username: 'owner' }
      });
      User.findByUsername.mockResolvedValue({ _id: 'user-1' });
      Project.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(project)
      });

      await getProject(request, response);

      expect(response.status).not.toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith(project);
    });

    it('allows anyone to access public project', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123', username: 'owner' });
      request.user = undefined;
      const response = new Response();

      const project = createMockProject({ visibility: 'Public' });
      User.findByUsername.mockResolvedValue({ _id: 'user-1' });
      Project.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(project)
      });

      await getProject(request, response);

      expect(response.status).not.toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith(project);
    });
  });

  describe('downloadProjectAsZip()', () => {
    it('returns 404 if project does not exist', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123' });
      const response = new Response();

      Project.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await downloadProjectAsZip(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project with that id does not exist'
      });
    });

    it('returns 403 if private project is accessed by unauthenticated user', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123' });
      request.user = undefined;
      const response = new Response();

      const project = createMockProject({ visibility: 'Private' });
      Project.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(project)
      });

      await downloadProjectAsZip(request, response);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project is private'
      });
    });

    it('returns 403 if private project is accessed by non-owner', async () => {
      const request = new Request();
      request.setParams({ project_id: 'project-123' });
      request.user = { _id: 'other-user-id' };
      const response = new Response();

      const ownerId = { equals: jest.fn().mockReturnValue(false) };
      const project = createMockProject({
        visibility: 'Private',
        user: { _id: ownerId, username: 'owner' }
      });
      Project.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(project)
      });

      await downloadProjectAsZip(request, response);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project is private'
      });
      expect(ownerId.equals).toHaveBeenCalledWith('other-user-id');
    });
  });
});
