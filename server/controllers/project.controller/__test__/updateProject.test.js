/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';

import Project from '../../../models/project';
import { updateProject } from '../../project.controller';

jest.mock('../../../models/project');

describe('project.controller', () => {
  describe('updateProject()', () => {
    let request;
    let response;

    beforeEach(() => {
      request = new Request();
      response = new Response();
      response.send = jest.fn();
      response.json = jest.fn();
      response.status = jest.fn().mockReturnThis();
      Project.findById = jest.fn().mockReturnValue({ exec: jest.fn() });
      Project.findByIdAndUpdate = jest.fn();
      jest.clearAllMocks();
    });

    afterEach(() => {
      request.resetMocked();
      response.resetMocked();
    });

    it('returns 404 if project does not exist', async () => {
      request.setParams({ project_id: 'some-id' });
      request.user = { _id: 'owner-id' };
      request.body = { name: 'Test' };

      Project.findById().exec.mockResolvedValue(null);

      await updateProject(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.send).toHaveBeenCalledWith({
        success: false,
        message: 'Project with that id does not exist.'
      });
      expect(Project.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('returns 403 if project is not owned by authenticated user', async () => {
      const project = {
        user: { equals: jest.fn().mockReturnValue(false) }
      };
      request.setParams({ project_id: 'some-id' });
      request.user = { _id: 'other-user-id' };
      request.body = { name: 'Test' };

      Project.findById().exec.mockResolvedValue(project);

      await updateProject(request, response);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        success: false,
        message: 'Session does not match owner of project.'
      });
      expect(Project.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('only updates whitelisted fields (user and slug in body are ignored)', async () => {
      const ownerId = 'owner-123';
      const project = {
        _id: 'proj-1',
        user: { equals: (id) => id === ownerId },
        updatedAt: new Date('2024-01-01'),
        files: []
      };
      const updatedDoc = {
        _id: 'proj-1',
        user: ownerId,
        name: 'Updated name',
        slug: 'original-slug',
        files: []
      };

      request.setParams({ project_id: 'proj-1' });
      request.user = { _id: ownerId };
      request.body = {
        name: 'Updated name',
        user: 'another-user-id',
        slug: 'hacked-slug'
      };

      Project.findById().exec.mockResolvedValue(project);
      Project.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedDoc)
      });

      await updateProject(request, response);

      expect(Project.findByIdAndUpdate).toHaveBeenCalled();
      const updateArg = Project.findByIdAndUpdate.mock.calls[0][1];
      const setPayload = updateArg.$set;

      expect(setPayload).toHaveProperty('name', 'Updated name');
      expect(setPayload).not.toHaveProperty('user');
      expect(setPayload).not.toHaveProperty('slug');
    });

    it('allows updating whitelisted fields (name, visibility, updatedAt)', async () => {
      const ownerId = 'owner-123';
      const project = {
        _id: 'proj-1',
        user: { equals: (id) => id === ownerId },
        updatedAt: new Date('2024-01-01'),
        files: []
      };

      request.setParams({ project_id: 'proj-1' });
      request.user = { _id: ownerId };
      request.body = {
        name: 'New name',
        visibility: 'Private',
        updatedAt: new Date('2024-01-02')
      };

      Project.findById().exec.mockResolvedValue(project);
      Project.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({})
      });

      await updateProject(request, response);

      const updateArg = Project.findByIdAndUpdate.mock.calls[0][1];
      const setPayload = updateArg.$set;

      expect(setPayload).toHaveProperty('name', 'New name');
      expect(setPayload).toHaveProperty('visibility', 'Private');
      expect(setPayload).toHaveProperty('updatedAt');
    });
  });
});
