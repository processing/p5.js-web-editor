import Collection from '../../models/collection';
import { User } from '../../models/user';

async function getOwnerUserId(req) {
  if (req.params.username) {
    const user = await User.findByUsername(req.params.username);
    if (user && user._id) {
      return user._id;
    }
  } else if (req.user._id) {
    return req.user._id;
  }

  return null;
}

export default async function listCollections(req, res) {
  const sendFailure = ({ code = 500, message = 'Something went wrong' }) => {
    res.status(code).json({ success: false, message });
  };

  const sendSuccess = (payload) => {
    res.status(200).json(payload);
  };

  const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(String(value), 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return fallback;
  };

  const coerceSortDir = (value) => {
    const v = String(value || '').toLowerCase();
    return v === 'asc' ? 'asc' : 'desc';
  };

  const coerceSortField = (value) => {
    const allowed = new Set(['updatedAt', 'createdAt', 'name']);
    const v = String(value || '');
    return allowed.has(v) ? v : 'updatedAt';
  };

  const shouldPaginate = () =>
    typeof req.query.page !== 'undefined' ||
    typeof req.query.limit !== 'undefined' ||
    typeof req.query.sortField !== 'undefined' ||
    typeof req.query.sortDir !== 'undefined' ||
    typeof req.query.q !== 'undefined';

  try {
    const ownerId = await getOwnerUserId(req);

    if (!ownerId) {
      return sendFailure({ code: 404, message: 'User not found' });
    }

    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10);
    const sortField = coerceSortField(req.query.sortField);
    const sortDir = coerceSortDir(req.query.sortDir);
    const q = String(req.query.q || '').trim();

    const query = { owner: ownerId };
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }

    const baseFind = Collection.find(query).populate([
      { path: 'owner', select: ['id', 'username'] },
      {
        path: 'items.project',
        select: ['id', 'name', 'slug', 'visibility'],
        populate: { path: 'user', select: ['username'] }
      }
    ]);

    const isOwner = req.user && req.user._id.equals(ownerId);

    if (!shouldPaginate()) {
      const collections = await baseFind.exec();

      if (isOwner) {
        return sendSuccess(collections);
      }

      const publicCollections = collections.map((collection) => {
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

      return sendSuccess(publicCollections);
    }

    const totalCollections = await Collection.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalCollections / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const collections = await baseFind
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .exec();

    const normalizedCollections = isOwner
      ? collections
      : collections.map((collection) => {
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

    return sendSuccess({
      collections: normalizedCollections,
      metadata: {
        page: safePage,
        totalPages,
        totalCollections,
        limit,
        hasPagination: totalPages > 1
      }
    });
  } catch (error) {
    return sendFailure({
      code: error.code || 500,
      message: error.message || 'Something went wrong'
    });
  }
}
