const { Chat, User } = require('../models');

exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  let chat = await Chat.findOne({
    where: { isGroupChat: false },
    include: [{ model: User, as: 'users', where: { id: userId }, attributes: [] }],
  });
  if (!chat) {
    chat = await Chat.create({ chatName: 'direct', isGroupChat: false });
    await chat.addUsers([req.user.id, userId]);
  }
  res.json(chat);
};

exports.fetchChats = async (req, res) => {
  const chats = await Chat.findAll({
    include: [{ model: User, as: 'users', attributes: ['id', 'name', 'email', 'pic'] }],
  });
  res.json(chats);
};

exports.createGroupChat = async (req, res) => {
  const { users, name } = req.body;
  const group = await Chat.create({
    chatName: name, isGroupChat: true, groupAdminId: req.user.id,
  });
  await group.addUsers([...JSON.parse(users), req.user.id]);
  res.json(group);
};

exports.renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  await Chat.update({ chatName }, { where: { id: chatId } });
  res.json({ message: 'Renamed successfully' });
};

exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const chat = await Chat.findByPk(chatId);
  await chat.addUser(userId);
  res.json({ message: 'User added' });
};

exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const chat = await Chat.findByPk(chatId);
  await chat.removeUser(userId);
  res.json({ message: 'User removed' });
};