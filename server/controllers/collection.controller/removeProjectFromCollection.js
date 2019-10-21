import Collection from '../../models/collection';

export default function addProjectToCollection(req, res) {
  const owner = req.user._id;
  const { id: collectionId, projectId } = req.params;

  function sendFailure({ code = 500, message = 'Something went wrong' }) {
    res.status(code).json({ success: false, message });
  }

  function sendSuccess(collection) {
    res.status(200).json(collection);
  }

  function updateCollection(collection) {
    if (collection == null) {
      sendFailure({ code: 404, message: 'Collection not found' });
      return null;
    }

    if (!collection.owner.equals(owner)) {
      sendFailure({ code: 403, message: 'User does not own this collection' });
      return null;
    }

    const project = collection.items.find(p => p.project._id === projectId);

    if (project != null) {
      project.remove();
      return collection.save();
    }

    const error = new Error('not found');
    error.code = 404;

    throw error;
  }

  function populateReferences(collection) {
    return Collection.populate(
      collection,
      [
        { path: 'owner', select: ['id', 'username'] },
        {
          path: 'items.project',
          select: ['id', 'name', 'slug'],
          populate: {
            path: 'user', select: ['username']
          }
        }
      ]
    );
  }

  return Collection.findById(collectionId)
    .populate('items.project', '_id')
    .then(updateCollection)
    .then(populateReferences)
    .then(sendSuccess)
    .catch(sendFailure);
}
