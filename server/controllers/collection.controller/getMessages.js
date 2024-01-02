import Messages from '../../models/messages';

export default async function reqToOwner(req, res) {
  const { owner, user } = req.body;
  console.log(owner, user);

  try {
    const messages = await Messages.findById({
      owner: owner._id
    });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
