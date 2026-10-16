import Collection from '../../models/collection';
import { User } from '../../models/user';

/**
 * Fetches collections for the username in the request with pagination support.
 * Handles errors and returns a success response.
 */
const createCoreHandler = (mapCollectionsToResponse) => async (req, res) => {
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
    const filter = { owner: user._id };

    if (q && q.trim()) {
      const term = q.trim();
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escaped, $options: 'i' };
    }

    const usePagination = page !== undefined && limit !== undefined;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const dir = sortDir === 'desc' ? -1 : 1;
    const allowedSortFields = new Set(['name', 'createdAt', 'updatedAt']);
    const safeSortField = allowedSortFields.has(sortField)
      ? sortField
      : 'updatedAt';

    const query = Collection.find(filter)
      .sort({ [safeSortField]: dir, _id: dir })
      .populate([
        { path: 'owner', select: ['id', 'username'] },
        {
          path: 'items.project',
          select: ['id', 'name', 'slug', 'visibility'],
          populate: {
            path: 'user',
            select: ['username']
          }
        }
      ]);

    if (usePagination) {
      query.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
    }

    const collections = await query.exec();

    const totalCollections = usePagination
      ? await Collection.countDocuments(filter)
      : collections.length;

    let processedCollections = collections;
    if (!canViewPrivate) {
      processedCollections = collections.map((collection) => {
        const { items: originalItems } = collection;
        const items = originalItems.filter(
          (item) => item.project && item.project.visibility === 'Public'
        );
        return {
          ...collection.toObject(),
          items,
          id: collection._id
        };
      });
    }

    const response = {
      collections: mapCollectionsToResponse(processedCollections),
      ...(usePagination && {
        metadata: {
          page: parsedPage,
          totalPages: Math.max(Math.ceil(totalCollections / parsedLimit), 1),
          totalCollections,
          limit: parsedLimit,
          hasPagination: true
        }
      })
    };

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching collections' });
  }
};

const getCollectionsForUser = createCoreHandler((collections) => collections);
export default getCollectionsForUser;

export const apiGetCollectionsForUser = createCoreHandler((collections) => ({
  collections
}));
