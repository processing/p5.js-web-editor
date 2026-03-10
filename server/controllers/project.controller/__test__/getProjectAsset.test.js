/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';
import axios from 'axios';
import mime from 'mime';
import Project from '../../../models/project';
import { getProjectAsset } from '../../project.controller';
import { resolvePathToFile } from '../../../utils/filePath';

jest.mock('../../../models/project');
jest.mock('../../../utils/filePath');
jest.mock('mime');
jest.mock('axios');

describe('project.controller', () => {
  describe('getProjectAsset()', () => {
    let request;
    let response;

    beforeEach(() => {
      request = new Request();
      response = new Response();
      response.send = jest.fn();
      response.status = jest.fn().mockReturnThis();
      response.set = jest.fn().mockReturnThis();
      request.setParams({ project_id: 'project-123', 0: 'image.png' });
      Project.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn()
      });
      jest.clearAllMocks();
    });

    afterEach(() => {
      request.resetMocked();
      response.resetMocked();
    });

    it('returns 404 if project does not exist', async () => {
      Project.findOne().populate().exec.mockResolvedValue(null);

      await getProjectAsset(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project with that id does not exist'
      });
    });

    it('returns 403 if private project is accessed by unauthenticated user', async () => {
      const project = {
        _id: 'project-123',
        visibility: 'Private',
        user: { _id: { equals: jest.fn() } },
        files: []
      };
      request.user = undefined;

      Project.findOne().populate().exec.mockResolvedValue(project);

      await getProjectAsset(request, response);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project is private'
      });
    });

    it('returns 403 if private project is accessed by non-owner', async () => {
      const ownerId = { equals: jest.fn().mockReturnValue(false) };
      const project = {
        _id: 'project-123',
        visibility: 'Private',
        user: { _id: ownerId },
        files: []
      };
      request.user = { _id: 'other-user-id' };

      Project.findOne().populate().exec.mockResolvedValue(project);

      await getProjectAsset(request, response);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Project is private'
      });
      expect(ownerId.equals).toHaveBeenCalledWith('other-user-id');
    });

    it('allows owner to access private project assets', async () => {
      const ownerId = 'owner-123';
      const ownerIdObj = { equals: jest.fn().mockReturnValue(true) };
      const project = {
        _id: 'project-123',
        visibility: 'Private',
        user: { _id: ownerIdObj },
        files: []
      };
      const resolvedFile = {
        name: 'image.png',
        content: Buffer.from('image content')
      };

      request.user = { _id: ownerId };
      Project.findOne().populate().exec.mockResolvedValue(project);
      resolvePathToFile.mockReturnValue(resolvedFile);
      mime.getType.mockReturnValue('image/png');

      await getProjectAsset(request, response);

      expect(ownerIdObj.equals).toHaveBeenCalledWith(ownerId);
      expect(response.status).not.toHaveBeenCalledWith(403);
      expect(response.set).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(response.send).toHaveBeenCalledWith(resolvedFile.content);
    });

    it('allows anyone to access public project assets', async () => {
      const project = {
        _id: 'project-123',
        visibility: 'Public',
        user: { _id: { equals: jest.fn() } },
        files: []
      };
      const resolvedFile = {
        name: 'image.png',
        content: Buffer.from('image content')
      };

      request.user = undefined; // unauthenticated
      Project.findOne().populate().exec.mockResolvedValue(project);
      resolvePathToFile.mockReturnValue(resolvedFile);
      mime.getType.mockReturnValue('image/png');

      await getProjectAsset(request, response);

      expect(response.status).not.toHaveBeenCalledWith(403);
      expect(response.set).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(response.send).toHaveBeenCalledWith(resolvedFile.content);
    });

    it('returns 404 if asset does not exist', async () => {
      const project = {
        _id: 'project-123',
        visibility: 'Public',
        user: { _id: { equals: jest.fn() } },
        files: []
      };

      Project.findOne().populate().exec.mockResolvedValue(project);
      resolvePathToFile.mockReturnValue(null);

      await getProjectAsset(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Asset does not exist'
      });
    });

    it('fetches and serves asset from URL when resolvedFile has url', async () => {
      const project = {
        _id: 'project-123',
        visibility: 'Public',
        user: { _id: { equals: jest.fn() } },
        files: []
      };
      const resolvedFile = {
        name: 'image.png',
        url: 'https://example.com/image.png'
      };
      const imageData = Buffer.from('image data');

      Project.findOne().populate().exec.mockResolvedValue(project);
      resolvePathToFile.mockReturnValue(resolvedFile);
      mime.getType.mockReturnValue('image/png');
      axios.get.mockResolvedValue({ data: imageData });

      await getProjectAsset(request, response);

      expect(axios.get).toHaveBeenCalledWith(resolvedFile.url, {
        responseType: 'arraybuffer'
      });
      expect(response.set).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(response.send).toHaveBeenCalledWith(imageData);
    });

    it('returns 404 if fetching asset URL fails', async () => {
      const project = {
        _id: 'project-123',
        visibility: 'Public',
        user: { _id: { equals: jest.fn() } },
        files: []
      };
      const resolvedFile = {
        name: 'image.png',
        url: 'https://example.com/image.png'
      };

      Project.findOne().populate().exec.mockResolvedValue(project);
      resolvePathToFile.mockReturnValue(resolvedFile);
      mime.getType.mockReturnValue('image/png');
      axios.get.mockRejectedValue(new Error('Network error'));

      await getProjectAsset(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.send).toHaveBeenCalledWith({
        message: 'Asset does not exist'
      });
    });
  });
});
