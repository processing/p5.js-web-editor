/**
 * @jest-environment node
 */
import { Request, Response } from 'jest-express';
import Project from '../../../models/project';
import createProject, { apiCreateProject } from '../createProject';

jest.mock('../../../models/project');

describe('project.controller', () => {
  describe('createProject()', () => {
    let request;
    let response;

    beforeEach(() => {
      request = new Request();
      response = new Response();
      Project.create = jest.fn();
      Project.populate = jest.fn();
      jest.clearAllMocks();
    });

    afterEach(() => {
      request.resetMocked();
      response.resetMocked();
    });

    it('fails if create fails', async () => {
      const error = new Error('An error');

      Project.create.mockRejectedValue(error);

      request.user = {};

      await createProject(request, response);

      expect(response.json).toHaveBeenCalledWith({ success: false });
    });

    it('extracts parameters from request body', async () => {
      request.user = { _id: 'abc123' };
      request.body = {
        name: 'Wriggly worm',
        files: [{ name: 'file.js', content: 'var hello = true;' }]
      };

      Project.create.mockResolvedValue({});

      await createProject(request, response);

      expect(response.json).toHaveBeenCalled();
    });

    it('populates referenced user on project creation', async () => {
      request.user = { _id: 'abc123' };

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

      Project.create.mockResolvedValue(result);
      Project.populate.mockResolvedValue(resultWithUser);

      await createProject(request, response);

      const doc = response.json.mock.calls[0][0];

      expect(response.json).toHaveBeenCalled();
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(resultWithUser);
    });

    it('fails if referenced user population fails', async () => {
      request.user = { _id: 'abc123' };

      const result = {
        _id: 'abc123',
        id: 'abc123',
        name: 'Project name',
        serveSecure: false,
        files: []
      };

      const error = new Error('An error');

      Project.create.mockResolvedValue(result);
      Project.populate.mockRejectedValue(error);

      await createProject(request, response);

      expect(response.json).toHaveBeenCalledWith({ success: false });
    });
  });

  describe('apiCreateProject()', () => {
    let request;
    let response;

    beforeEach(() => {
      request = new Request();
      response = new Response();
      Project.prototype.isSlugUnique = jest.fn();
      Project.prototype.save = jest.fn();
      jest.clearAllMocks();
    });

    afterEach(() => {
      request.resetMocked();
      response.resetMocked();
    });

    it('returns 201 with id of created sketch', async () => {
      request.user = { _id: 'abc123', username: 'alice' };
      request.params = { username: 'alice' };
      request.body = {
        name: 'My sketch',
        files: {}
      };

      const result = {
        _id: 'abc123',
        id: 'abc123',
        name: 'Project name',
        serveSecure: false,
        files: []
      };

      Project.prototype.isSlugUnique.mockResolvedValue({
        isUnique: true,
        conflictingIds: []
      });

      Project.prototype.save.mockResolvedValue(result);

      await apiCreateProject(request, response);

      const doc = response.json.mock.calls[0][0];

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalled();

      expect(JSON.parse(JSON.stringify(doc))).toMatchObject({
        id: 'abc123'
      });
    });

    it('fails if slug is not unique', async () => {
      request.user = { _id: 'abc123', username: 'alice' };
      request.params = { username: 'alice' };
      request.body = {
        name: 'My sketch',
        slug: 'a-slug',
        files: {}
      };

      Project.prototype.isSlugUnique.mockResolvedValue({
        isUnique: false,
        conflictingIds: ['cde123']
      });

      await apiCreateProject(request, response);
      const doc = response.json.mock.calls[0][0];

      expect(response.status).toHaveBeenCalledWith(409);
      expect(response.json).toHaveBeenCalled();

      expect(JSON.parse(JSON.stringify(doc))).toMatchObject({
        message: 'Sketch Validation Failed',
        detail: 'Slug "a-slug" is not unique. Check cde123'
      });
    });

    it('fails if user does not have permission', async () => {
      // We don't want to clog up the jest output with extra
      // logs, so we turn off console warn for this one test.
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      request.user = { _id: 'abc123', username: 'alice' };
      request.params = {
        username: 'dana'
      };
      request.body = {
        name: 'My sketch',
        slug: 'a-slug',
        files: {}
      };

      Project.prototype.isSlugUnique.mockResolvedValue({
        isUnique: true,
        conflictingIds: []
      });

      await apiCreateProject(request, response);
      const doc = response.json.mock.calls[0][0];

      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalled();

      expect(JSON.parse(JSON.stringify(doc))).toMatchObject({
        message: 'Sketch Validation Failed',
        detail: "'alice' does not have permission to create for 'dana'"
      });
    });

    it('returns validation errors on files input', async () => {
      request.user = { username: 'alice' };
      request.params = { username: 'alice' };
      request.body = {
        name: 'My sketch',
        files: {
          'index.html': {
            // missing content or url
          }
        }
      };

      await apiCreateProject(request, response);

      const doc = response.json.mock.calls[0][0];

      const responseBody = JSON.parse(JSON.stringify(doc));

      expect(response.status).toHaveBeenCalledWith(422);
      expect(responseBody.message).toBe('File Validation Failed');
      expect(responseBody.detail).not.toBeNull();
      expect(responseBody.errors.length).toBe(1);
      expect(responseBody.errors).toEqual([
        { name: 'index.html', message: "missing 'url' or 'content'" }
      ]);
    });

    it('rejects file parameters not in object format', async () => {
      request.user = { _id: 'abc123', username: 'alice' };
      request.params = { username: 'alice' };
      request.body = {
        name: 'Wriggly worm',
        files: [{ name: 'file.js', content: 'var hello = true;' }]
      };

      await apiCreateProject(request, response);

      const doc = response.json.mock.calls[0][0];

      const responseBody = JSON.parse(JSON.stringify(doc));

      expect(response.status).toHaveBeenCalledWith(422);
      expect(responseBody.message).toBe('File Validation Failed');
      expect(responseBody.detail).toBe("'files' must be an object");
    });

    it('rejects if files object in not provided', async () => {
      request.user = { _id: 'abc123', username: 'alice' };
      request.params = { username: 'alice' };
      request.body = {
        name: 'Wriggly worm'
        // files: {} is missing
      };

      await apiCreateProject(request, response);

      const doc = response.json.mock.calls[0][0];
      const responseBody = JSON.parse(JSON.stringify(doc));

      expect(response.status).toHaveBeenCalledWith(422);
      expect(responseBody.message).toBe('File Validation Failed');
      expect(responseBody.detail).toBe("'files' must be an object");
    });
  });
});
