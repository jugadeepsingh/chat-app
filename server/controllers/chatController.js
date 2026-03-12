const { Chat, User } = require('../models');

exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const chats = await Chat.findAll({
      where: { isGroupChat: false },
      include: [{ model: User, as: 'users', attributes: ['id', 'name', 'email', 'pic'] }],
    });

    const existing = chats.find(c => {
      const ids = c.users.map(u => u.id);
      return ids.includes(req.user.id) && ids.includes(userId);
    });

    if (existing) return res.json(existing);

    const chat = await Chat.create({ chatName: 'direct', isGroupChat: false });
    await chat.addUsers([req.user.id, userId]);
    const full = await Chat.findByPk(chat.id, {
      include: [{ model: User, as: 'users', attributes: ['id', 'name', 'email', 'pic'] }],
    });
    res.json(full);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.fetchChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [{
        model: User,
        as: 'users',
        where: { id: req.user.id },
        attributes: ['id', 'name', 'email', 'pic'],
      }],
    });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGroupChat = async (req, res) => {
  try {
    const { users, name } = req.body;
    if (!users || !name) return res.status(400).json({ message: "Missing fields" });
    const parsedUsers = JSON.parse(users);
    if (parsedUsers.length < 2) return res.status(400).json({ message: "Need at least 2 users" });

    const group = await Chat.create({
      chatName: name,
      isGroupChat: true,
      groupAdminId: req.user.id,
    });
    await group.addUsers([...parsedUsers, req.user.id]);
    const full = await Chat.findByPk(group.id, {
      include: [{ model: User, as: 'users', attributes: ['id', 'name', 'email', 'pic'] }],
    });
    res.json(full);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    if (!chatId || !chatName) return res.status(400).json({ message: "Missing fields" });
    await Chat.update({ chatName }, { where: { id: chatId } });
    const updated = await Chat.findByPk(chatId, {
      include: [{ model: User, as: 'users', attributes: ['id', 'name', 'email', 'pic'] }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) return res.status(400).json({ message: "Missing fields" });
    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    await chat.addUser(userId);
    const updated = await Chat.findByPk(chatId, {
      include: [{ model: User, as: 'users', attributes: ['id', 'name', 'email', 'pic'] }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) return res.status(400).json({ message: "Missing fields" });
    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    await chat.removeUser(userId);
    const updated = await Chat.findByPk(chatId, {
      include: [{ model: User, as: 'users', attributes: ['id', 'name', 'email', 'pic'] }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};