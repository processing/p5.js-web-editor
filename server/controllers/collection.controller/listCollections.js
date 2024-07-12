import Collection from '../../models/collection';
import User from '../../models/user';

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
    const owner = await getOwnerUserId(req);

    if (!owner) {
      sendFailure('404', 'User not found');
    }

    const collections = await Collection.find({ owner }).populate([
      { path: 'owner', select: ['id', 'username'] },
      {
        path: 'items.project',
        select: ['id', 'name', 'slug'],
        populate: {
          path: 'user',
          select: ['username']
        }
      }
    ]);

    sendSuccess(collections);
  } catch (error) {
    sendFailure(error.code || 500, error.message || 'Something went wrong');
  }
}
