import Messages from '../../models/messages';

export default async function disallowReq(req, res) {
  const { projectId, collectionId } = req.params;

  if (collectionId == null) {
    return res
      .status(404)
      .json({ success: false, message: 'Collection not found' });
  }

  if (projectId == null) {
    return res
      .status(404)
      .json({ success: false, message: 'Project not found' });
  }

  try {
    await Messages.findOneAndDelete({
      projectID: projectId,
      collectionID: collectionId
    });
    return res
      .status(200)
      .json({ success: true, message: 'Request disallowed.' });
  } catch (error) {
    return res.status(504).json({ msg: 'Something went wrong!' });
  }
}
