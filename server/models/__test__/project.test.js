import differenceInSeconds from 'date-fns/differenceInSeconds';
import mongoose from 'mongoose';

import Project from '../project';

jest.mock('../project');

const datesWithinSeconds = (first, second) =>
  differenceInSeconds(first, second) < 2;

describe('models/project', () => {
  beforeEach(() => {
    Project.create = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('projectSchema', () => {
    it('sets default project properties', async () => {
      const data = {
        _id: new mongoose.Types.ObjectId(),
        name: "Hello p5.js, it's the server",
        serveSecure: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Project.create.mockResolvedValue(new Project(data));

      const newProject = await Project.create(data);

      expect(newProject).toBeDefined();
      expect(newProject.name).toBe("Hello p5.js, it's the server");
      expect(newProject.serveSecure).toBe(false);
    });

    it('creates a slug from the project name', async () => {
      const data = {
        _id: new mongoose.Types.ObjectId(),
        name: 'My project',
        slug: 'My_project',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Project.create.mockResolvedValue(new Project(data));

      const newProject = await Project.create(data);

      expect(newProject.slug).toBe('My_project');
    });

    it('exposes _id as id', async () => {
      const data = {
        _id: new mongoose.Types.ObjectId(),
        name: 'My project',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Project.create.mockResolvedValue(new Project(data));

      const newProject = await Project.create(data);

      expect(newProject.id).toBe(newProject._id);
    });

    it('generates timestamps', async () => {
      const data = {
        _id: new mongoose.Types.ObjectId(),
        name: 'My project',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const now = new Date();

      Project.create.mockResolvedValue(new Project(data));

      const newProject = await Project.create(data);
      // Dates should be near to now, by a few ms
      expect(newProject.createdAt).toBeInstanceOf(Date);
      expect(datesWithinSeconds(newProject.createdAt, now)).toBe(true);
      expect(newProject.updatedAt).toBeInstanceOf(Date);
      expect(datesWithinSeconds(newProject.updatedAt, now)).toBe(true);
    });

    it('serializes to JSON', async () => {
      const data = {
        _id: new mongoose.Types.ObjectId(),
        name: 'My project',
        slug: 'My_project',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Project.create.mockResolvedValue(new Project(data));

      const newProject = await Project.create(data);
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
    });
  });

  describe('fileSchema', () => {});
});
