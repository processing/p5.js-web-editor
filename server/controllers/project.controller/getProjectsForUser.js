import Project from '../../models/project';
import { User } from '../../models/user';
import { toApi as toApiProjectObject } from '../../domain-objects/Project';

/**
 * Fetches projects for the username in the request.
 * Handles errors.
 * Returns a success response based on the provided `mapProjectsToResponse` function.
 */
const createCoreHandler = (mapProjectsToResponse) => async (req, res) => {
  try {
    const { username } = req.params;
    const { page, limit, sortField, sortDir, q } = req.query;

    if (!username) {
      return res.status(422).json({ message: 'Username not provided' });
    }

    const user = await User.findByUsername(username);

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with that username does not exist.' });
    }

    const canViewPrivate = req.user && req.user._id.equals(user._id);
    const filter = { user: user._id };

    if (!canViewPrivate) {
      filter.visibility = { $ne: 'Private' };
    }

    if (q && q.trim()) {
      const term = q.trim();
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.name = { $regex: escaped, $options: 'i' };
    }

    const usePagination = page !== undefined && limit !== undefined;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const dir = sortDir === 'desc' ? -1 : 1;
    const allowedSortFields = new Set([
      'name',
      'createdAt',
      'updatedAt',
      'visibility'
    ]);
    const safeSortField = allowedSortFields.has(sortField)
      ? sortField
      : 'updatedAt';

    const query = Project.find(filter)
      .sort({ [safeSortField]: dir, _id: dir })
      .select('name files id createdAt updatedAt visibility');

    if (usePagination) {
      query.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
    }

    const projects = await query.exec();

    const totalProjects = usePagination
      ? await Project.countDocuments(filter)
      : projects.length;

    const response = {
      projects: mapProjectsToResponse(projects),
      ...(usePagination && {
        metadata: {
          page: parsedPage,
          totalPages: Math.max(Math.ceil(totalProjects / parsedLimit), 1),
          totalProjects,
          limit: parsedLimit,
          hasPagination: true
        }
      })
    };

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching projects' });
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
