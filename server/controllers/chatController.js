const { Chat, User } = require("../models");

/* ================================
   Access or create personal chat
================================ */
exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId not provided" });
    }

    let chat = await Chat.findOne({
      where: { isGroupChat: false },
      include: [
        {
          model: User,
          as: "users",
          where: { id: [req.user.id, userId] },
          attributes: ["id", "name", "email", "pic"],
          through: { attributes: [] },
        },
      ],
    });

    if (chat) {
      return res.json(chat);
    }

    const newChat = await Chat.create({
      chatName: "direct",
      isGroupChat: false,
    });

    await newChat.addUsers([req.user.id, userId]);

    const fullChat = await Chat.findByPk(newChat.id, {
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id", "name", "email", "pic"],
          through: { attributes: [] },
        },
      ],
    });

    res.json(fullChat);
  } catch (error) {
    console.error("Access chat error:", error);
    res.status(500).json({ message: "Failed to access chat" });
  }
};

/* ================================
   Fetch all chats of logged user
================================ */
exports.fetchChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id", "name", "email", "pic"],
          through: { attributes: [] },
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.json(chats);
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

/* ================================
   Create group chat
================================ */
exports.createGroupChat = async (req, res) => {
  try {
    const { users, name } = req.body;

    if (!users || !name) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const parsedUsers = JSON.parse(users);

    if (parsedUsers.length < 2) {
      return res
        .status(400)
        .json({ message: "More than 2 users required to form group" });
    }

    const group = await Chat.create({
      chatName: name,
      isGroupChat: true,
      groupAdminId: req.user.id,
    });

    await group.addUsers([...parsedUsers, req.user.id]);

    const fullGroup = await Chat.findByPk(group.id, {
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id", "name", "email", "pic"],
          through: { attributes: [] },
        },
      ],
    });

    res.json(fullGroup);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

/* ================================
   Rename group
================================ */
exports.renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    await Chat.update({ chatName }, { where: { id: chatId } });

    res.json({ message: "Group renamed successfully" });
  } catch (error) {
    console.error("Rename group error:", error);
    res.status(500).json({ message: "Failed to rename group" });
  }
};

/* ================================
   Add user to group
================================ */
exports.addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findByPk(chatId);

    await chat.addUser(userId);

    res.json({ message: "User added to group" });
  } catch (error) {
    console.error("Add to group error:", error);
    res.status(500).json({ message: "Failed to add user" });
  }
};

/* ================================
   Remove user from group
================================ */
exports.removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findByPk(chatId);

    await chat.removeUser(userId);

    res.json({ message: "User removed from group" });
  } catch (error) {
    console.error("Remove from group error:", error);
    res.status(500).json({ message: "Failed to remove user" });
  }
};