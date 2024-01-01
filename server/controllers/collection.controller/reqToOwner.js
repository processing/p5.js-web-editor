import Collection from '../../models/collection';
import Messages from '../../models/messages';
import Project from '../../models/project';

export default function reqToOwner(req, res) {
  const { collectionId, projectId, owner, user } = req.body;
  console.log(collectionId, projectId, owner, user);

  const collectionPromise = Collection.findById(collectionId).populate(
    'items.project',
    '_id'
  );
  const projectPromise = Project.findById(projectId);

  function sendFailure(code = 500, message = 'Something went wrong') {
    res.status(code).json({ success: false, message });
  }

  function sendSuccess() {
    res.status(200).json({ success: true });
  }

  function sendReq([collection, project]) {
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

    const projectInCollection = collection.items.find(
      (p) => p.projectId === project._id
    );

    if (projectInCollection) {
      sendFailure(404, 'Project already in collection');
      return null;
    }

    try {
      const newMsgs = new Messages({
        msg: `${user} wants to add their sketch in your ${collection} collection!`,
        user: user._id
      });

      newMsgs.save();
      return res.status(200).json(newMsgs);
    } catch (error) {
      console.error(error);
      sendFailure(500, error.message);
      return null;
    }
  }

  Promise.all([collectionPromise, projectPromise])
    .then(sendReq)
    .then(sendSuccess)
    .catch(sendFailure);
}
