import Collection from '../../models/collection';
import Messages from '../../models/messages';
import Project from '../../models/project';

export default async function sendSketchRequest(req, res) {
  // eslint-disable-next-line prefer-destructuring
  const user = req.user;
  const { collectionId, projectId } = req.params;
  const { collectionOwner } = req.body;

  try {
    const [collection, project] = await Promise.all([
      Collection.findById(collectionId),
      Project.findById(projectId)
    ]);

    if (collection == null) {
      return res
        .status(404)
        .json({ success: false, message: 'Collection not found' });
    }

    if (project == null) {
      return res
        .status(404)
        .json({ success: false, message: 'Project not found' });
    }

    const projectInCollection = collection.items.find(
      (p) => p.projectId === project._id
    );

    if (projectInCollection) {
      return res
        .status(404)
        .json({ success: false, message: 'Project already in collection' });
    }

    // The variable 'msg' is temporary here later, we will need to display the actual message from the client side, allowing us to translate it into other langs
    // If we decide to proceed with migrating this to the frontend, we might want to store the entire 'project' and 'collection' schema instead of just their IDs. This would necessitate more changes around the codebase.

    const newMsgs = new Messages({
      msg: `${user.username} requested to add ${project.name} in your ${collection.name}`,
      projectID: projectId,
      collectionID: collectionId,
      reqReceiver: collectionOwner,
      reqSenderID: user._id,
      reqSenderUsername: user.username
    });

    await newMsgs.save();

    return res.status(200).json({ success: true, message: newMsgs.msg });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
