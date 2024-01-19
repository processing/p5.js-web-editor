import Messages from '../../models/messages';

export default async function getOthersRequests(req, res) {
  const owner = req.user._id;

  try {
    const messages = await Messages.find({
      reqReceiver: owner
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
