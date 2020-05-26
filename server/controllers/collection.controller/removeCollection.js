import Collection from '../../models/collection';


export default function createCollection(req, res) {
  const { id: collectionId } = req.params;
  const owner = req.user._id;

  function sendFailure({ code = 500, message = 'Something went wrong' }) {
    res.status(code).json({ success: false, message });
  }

  function sendSuccess() {
    res.status(200).json({ success: true });
  }

  function removeCollection(collection) {
    if (collection == null) {
      sendFailure({ code: 404, message: 'Not found, or you user does not own this collection' });
      return null;
    }

    return collection.remove();
  }

  function findCollection() {
    // Only returned if owner matches current user
    return Collection.findOne({ _id: collectionId, owner });
  }

  return findCollection()
    .then(removeCollection)
    .then(sendSuccess)
    .catch(sendFailure);
}
