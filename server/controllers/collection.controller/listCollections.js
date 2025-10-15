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

  const sendSuccess = (collections) => {
    res.status(200).json(collections);
  };

  try {
    const ownerId = await getOwnerUserId(req);

    if (!ownerId) {
      return sendFailure({ code: 404, message: 'User not found' });
    }

    const collections = await Collection.find({ owner: ownerId }).populate([
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

    const isOwner = req.user && req.user._id.equals(ownerId);

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
  } catch (error) {
    return sendFailure({
      code: error.code || 500,
      message: error.message || 'Something went wrong'
    });
  }
}
