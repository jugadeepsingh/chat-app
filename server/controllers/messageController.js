const { Message, User, Chat } = require('../models');

exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) return res.status(400).json({ message: 'Missing fields' });

    const message = await Message.create({
      content,
      chatId,
      senderId: req.user.id,
    });

    await Chat.update({ latestMessageId: message.id }, { where: { id: chatId } });

    const full = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'pic'] }],
    });
    res.json(full);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { chatId: req.params.chatId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'pic'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};