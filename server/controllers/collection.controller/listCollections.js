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

export default function listCollections(req, res) {
  function sendFailure({ code = 500, message = 'Something went wrong' }) {
    res.status(code).json({ success: false, message });
  }

  function sendSuccess(collections) {
    res.status(200).json(collections);
  }

  function findCollections(owner) {
    if (owner == null) {
      sendFailure({ code: 404, message: 'User not found' });
    }

    return Collection.find({ owner }).populate([
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
  }

  return getOwnerUserId(req)
    .then(findCollections)
    .then(sendSuccess)
    .catch(sendFailure);
}
