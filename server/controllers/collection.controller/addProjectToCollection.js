import Collection from '../../models/collection';
import Project from '../../models/project';

export default function addProjectToCollection(req, res) {
  const owner = req.user._id;
  const { id: collectionId, projectId } = req.params;

  const collectionPromise = Collection.findById(collectionId).populate('items.project', '_id');
  const projectPromise = Project.findById(projectId);

  function sendFailure(code, message) {
    res.status(code).json({ success: false, message });
  }

  function sendSuccess(collection) {
    res.status(200).json(collection);
  }

  function updateCollection([collection, project]) {
    if (collection == null) {
      sendFailure(404, 'Collection not found');
      return null;
    }

    if (project == null) {
      sendFailure(404, 'Project not found');
      return null;
    }

    if (!collection.owner.equals(owner)) {
      sendFailure(403, 'User does not own this collection');
      return null;
    }

    const projectInCollection = collection.items.find(p => p.projectId === project._id);

    if (projectInCollection) {
      sendFailure(404, 'Project already in collection');
      return null;
    }

    try {
      collection.items.push({ project });

      return collection.save();
    } catch (error) {
      console.error(error);
      sendFailure(500, error.message);
      return null;
    }
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

  return Promise.all([collectionPromise, projectPromise])
    .then(updateCollection)
    .then(populateReferences)
    .then(sendSuccess)
    .catch(sendFailure);
}
