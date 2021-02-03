import Collection from '../../models/collection';

export default function createCollection(req, res) {
  const owner = req.user._id;
  const { name, description, slug } = req.body;

  const values = {
    owner,
    name,
    description,
    slug
  };

  function sendFailure({ code = 500, message = 'Something went wrong' }) {
    res.status(code).json({ success: false, message });
  }

  function sendSuccess(newCollection) {
    res.json(newCollection);
  }

  function populateReferences(newCollection) {
    return Collection.populate(newCollection, [
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

  if (owner == null) {
    sendFailure({ code: 404, message: 'No user specified' });
    return null;
  }

  return Collection.create(values)
    .then(populateReferences)
    .then(sendSuccess)
    .catch(sendFailure);
}
