import mockingoose from 'mockingoose';
import differenceInSeconds from 'date-fns/differenceInSeconds';

import Project from '../project';

const datesWithinSeconds = (first, second) =>
  differenceInSeconds(first, second) < 2;

describe('models/project', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('projectSchema', () => {
    it('sets default project properties', (done) => {
      const data = {};

      mockingoose(Project).toReturn(data, 'create');

      Project.create(data, (err, newProject) => {
        expect(err).toBeNull();
        expect(newProject).toBeDefined();
        expect(newProject.name).toBe("Hello p5.js, it's the server");
        expect(newProject.serveSecure).toBe(false);
        done();
      });
    });

    it('creates a slug from the project name', (done) => {
      const data = { name: 'My project' };

      mockingoose(Project).toReturn(data, 'create');

      Project.create(data, (err, newProject) => {
        expect(newProject.slug).toBe('My_project');
        done();
      });
    });

    it('exposes _id as id', (done) => {
      const data = { name: 'My project' };

      mockingoose(Project).toReturn(data, 'create');

      Project.create(data, (err, newProject) => {
        expect(newProject.id).toBe(newProject._id);
        done();
      });
    });

    it('generates timestamps', (done) => {
      const data = { name: 'My project' };
      const now = new Date();

      mockingoose(Project).toReturn(data, 'create');

      Project.create(data, (err, newProject) => {
        // Dates should be near to now, by a few ms
        expect(newProject.createdAt).toBeInstanceOf(Date);

        expect(datesWithinSeconds(newProject.createdAt, now)).toBe(true);

        expect(newProject.updatedAt).toBeInstanceOf(Date);
        expect(datesWithinSeconds(newProject.updatedAt, now)).toBe(true);

        done();
      });
    });

    it('serializes to JSON', (done) => {
      const data = { name: 'My project' };

      mockingoose(Project).toReturn(data, 'create');

      Project.create(data, (err, newProject) => {
        const now = new Date();
        const object = JSON.parse(JSON.stringify(newProject));

        expect(object).toMatchObject({
          _id: newProject._id,
          name: 'My project',
          id: newProject._id,
          slug: 'My_project',
          files: [],
          serveSecure: false
        });

        // Check that the timestamps deserialise
        const createdAt = new Date(object.createdAt);
        const updatedAt = new Date(object.updatedAt);

        expect(datesWithinSeconds(createdAt, now)).toBe(true);
        expect(datesWithinSeconds(updatedAt, now)).toBe(true);

        done();
      });
    });
  });

  describe('fileSchema', () => {});
});
