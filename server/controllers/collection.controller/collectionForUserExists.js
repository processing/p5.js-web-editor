import Collection from '../../models/collection';
import User from '../../models/user';

export default function collectionForUserExists(
  username,
  collectionId,
  callback
) {
  function sendFailure() {
    callback(false);
  }

  function sendSuccess(collection) {
    callback(collection != null);
  }

  function findUser() {
    return User.findByUsername(username);
  }

  function findCollection(owner) {
    if (owner == null) {
      throw new Error('User not found');
    }

    return Collection.findOne({ _id: collectionId, owner });
  }

  return findUser().then(findCollection).then(sendSuccess).catch(sendFailure);
}
