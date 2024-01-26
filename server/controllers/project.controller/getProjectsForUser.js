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
      .select('name files id createdAt updatedAt')
      .exec();
    const response = mapProjectsToResponse(projects);
    res.json(response);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching projects' });
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
