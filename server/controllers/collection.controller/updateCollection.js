import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import Collection from '../../models/collection';

function removeUndefined(obj) {
  return omitBy(obj, isUndefined);
}

export default function createCollection(req, res) {
  const { id: collectionId } = req.params;
  const owner = req.user._id;
  const { name, description, slug } = req.body;

  const values = removeUndefined({
    name,
    description,
    slug
  });

  function sendFailure({ code = 500, message = 'Something went wrong' }) {
    res.status(code).json({ success: false, message });
  }

  function sendSuccess(collection) {
    if (collection == null) {
      sendFailure({ code: 404, message: 'Not found, or you user does not own this collection' });
      return;
    }

    res.json(collection);
  }

  async function findAndUpdateCollection() {
    // Only update if owner matches current user
    return Collection.findOneAndUpdate(
      { _id: collectionId, owner },
      values,
      { new: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate([
      { path: 'owner', select: ['id', 'username'] },
      {
        path: 'items.project',
        select: ['id', 'name', 'slug'],
        populate: {
          path: 'user', select: ['username']
        }
      }
    ]).exec();
  }

  return findAndUpdateCollection()
    .then(sendSuccess)
    .catch(sendFailure);
}
