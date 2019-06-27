/**
 * @jest-environment node
 */
import { Response } from 'jest-express';

import Project, { createMock, createInstanceMock } from '../../../models/project';
import createProject, { apiCreateProject } from '../createProject';

jest.mock('../../../models/project');

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
        body: {
          name: 'Wriggly worm',
          files: [{ name: 'file.js', content: 'var hello = true;' }]
        }
      };
      const response = new Response();


      ProjectMock
        .expects('create')
        .withArgs({
          user: 'abc123',
          name: 'Wriggly worm',
          files: [{ name: 'file.js', content: 'var hello = true;' }]
        })
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

  describe('apiCreateProject()', () => {
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

    it('returns 201 with id of created sketch', (done) => {
      const request = {
        user: { _id: 'abc123' },
        body: {
          name: 'My sketch',
          files: {}
        }
      };
      const response = new Response();

      const result = {
        _id: 'abc123',
        id: 'abc123',
        name: 'Project name',
        serveSecure: false,
        files: []
      };

      ProjectInstanceMock.expects('isSlugUnique')
        .resolves({ isUnique: true, conflictingIds: [] });

      ProjectInstanceMock.expects('save')
        .resolves(new Project(result));

      const promise = apiCreateProject(request, response);

      function expectations() {
        const doc = response.json.mock.calls[0][0];

        expect(response.status).toHaveBeenCalledWith(201);
        expect(response.json).toHaveBeenCalled();

        expect(JSON.parse(JSON.stringify(doc))).toMatchObject({
          id: 'abc123'
        });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('fails if slug is not unique', (done) => {
      const request = {
        user: { _id: 'abc123' },
        body: {
          name: 'My sketch',
          slug: 'a-slug',
          files: {}
        }
      };
      const response = new Response();

      const result = {
        _id: 'abc123',
        id: 'abc123',
        name: 'Project name',
        // slug: 'a-slug',
        serveSecure: false,
        files: []
      };

      ProjectInstanceMock.expects('isSlugUnique')
        .resolves({ isUnique: false, conflictingIds: ['cde123'] });

      ProjectInstanceMock.expects('save')
        .resolves(new Project(result));

      const promise = apiCreateProject(request, response);

      function expectations() {
        const doc = response.json.mock.calls[0][0];

        expect(response.status).toHaveBeenCalledWith(409);
        expect(response.json).toHaveBeenCalled();

        expect(JSON.parse(JSON.stringify(doc))).toMatchObject({
          message: 'Slug "a-slug" is not unique. Check cde123'
        });

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('returns validation errors on files input', (done) => {
      const request = {
        user: {},
        body: {
          name: 'My sketch',
          files: {
            'index.html': {
              // missing content or url
            }
          }
        }
      };
      const response = new Response();

      const promise = apiCreateProject(request, response);

      function expectations() {
        const doc = response.json.mock.calls[0][0];

        const responseBody = JSON.parse(JSON.stringify(doc));

        expect(response.status).toHaveBeenCalledWith(422);
        expect(responseBody.name).toBe('File Validation Failed');
        expect(responseBody.errors.length).toBe(1);
        expect(responseBody.errors).toEqual([
          { name: 'index.html', message: 'missing \'url\' or \'content\'' }
        ]);

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });

    it('rejects file parameters not in object format', (done) => {
      const request = {
        user: { _id: 'abc123' },
        body: {
          name: 'Wriggly worm',
          files: [{ name: 'file.js', content: 'var hello = true;' }]
        }
      };
      const response = new Response();

      const promise = apiCreateProject(request, response);

      function expectations() {
        const doc = response.json.mock.calls[0][0];

        const responseBody = JSON.parse(JSON.stringify(doc));

        expect(response.status).toHaveBeenCalledWith(422);
        expect(responseBody.name).toBe('File Validation Failed');
        expect(responseBody.message).toBe('\'files\' must be an object');

        done();
      }

      promise.then(expectations, expectations).catch(expectations);
    });
  });
});
