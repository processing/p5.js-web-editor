import Collection from '../../models/collection';
import User from '../../models/user';

export default async function collectionForUserExists(username, collectionId) {
  const user = await User.findByUsername(username);
  if (!user) return false;
  const collection = await Collection.findOne({
    _id: collectionId,
    owner: user
  });
  return !!collection;
}
