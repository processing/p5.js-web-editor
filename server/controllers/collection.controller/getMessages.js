import Messages from '../../models/messages';

export default async function getMessages(req, res) {
  const owner = req.user._id;
  console.log(owner);

  try {
    const messages = await Messages.find({
      collectionOwner: owner
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
