const { Message, User, Chat } = require('../models');

exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId)
    return res.status(400).json({ message: 'Missing fields' });
  const message = await Message.create({ content, chatId, senderId: req.user.id });
  await Chat.update({ latestMessageId: message.id }, { where: { id: chatId } });
  const full = await Message.findByPk(message.id, {
    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'pic'] }],
  });
  res.json(full);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.findAll({
    where: { chatId: req.params.chatId },
    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'pic'] }],
    order: [['createdAt', 'ASC']],
  });
  res.json(messages);
};