import Project from '../../models/project';
import User from '../../models/user';
import { toApi as toApiProjectObject } from '../../domain-objects/Project';

/**
 * Fetches projects for the username in the request.
 * Handles errors.
 * Returns a success response based on the provided `mapProjectsToResponse` function.
 */
const createCoreHandler = (mapProjectsToResponse) => async (req, res) => {
  try {
    const { username } = req.params;
    const currentUser = req.user?._id || '';

    if (!username) {
      res.status(422).json({ message: 'Username not provided' });
      return;
    }

    const user = await User.findByUsername(username);
    if (!user) {
      res
        .status(404)
        .json({ message: 'User with that username does not exist.' });
      return;
    }

    const projects = await Project.find({ user: user._id })
      .sort('-createdAt')
      .select('name files id createdAt updatedAt visibility')
      .exec();

    const publicProjectsOnly = projects.filter(
      (project) => project.visibility === 'Public'
    );

    if (!req.user) {
      res.json(publicProjectsOnly);
      return;
    }

    const response = mapProjectsToResponse(
      !currentUser.equals(user._id) ? publicProjectsOnly : projects
    );

    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching projects' });
  }
};

/**
 * Main handler returns an array of project objects.
 */
const getProjectsForUser = createCoreHandler((projects) => projects);
export default getProjectsForUser;

/**
 * Handler for the public API returns an object with property `sketches`.
 * The array of sketches contains the `id` and `name` only.
 */
export const apiGetProjectsForUser = createCoreHandler((projects) => ({
  sketches: projects.map((p) => toApiProjectObject(p))
}));
