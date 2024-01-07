import Collection from '../../models/collection';
import Messages from '../../models/messages';
import Project from '../../models/project';

export default async function reqToOwner(req, res) {
  const { projectId } = req.params;
  const { collectionOwner, currentUsername, collectionId } = req.body;
  console.log(projectId);

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
    const newMsgs = await Messages.create({
      msg: `${currentUsername} wants to add their Sketch in your ${collection.name}`,
      reqSender: currentUsername,
      projectID: projectId,
      collectionID: collectionId,
      collectionOwner
    });

    await newMsgs.save();

    console.log(newMsgs);

    return res.status(200).json({ success: true, message: newMsgs.msg });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
