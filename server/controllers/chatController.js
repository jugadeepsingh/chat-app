const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc  Access or create one-on-one chat
// @route POST /api/chats
const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name email image",
    });

    if (chat.length > 0) {
      res.json(chat[0]);
    } else {
      const newChat = await Chat.create({
        chatName: "Direct Message",
        isGroupChat: false,
        users: [req.user._id, userId],
      });
      const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
        "users",
        "-password"
      );
      res.status(201).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all chats for a user
// @route GET /api/chats
const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email image",
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create group chat
// @route POST /api/chats/group
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name)
    return res.status(400).json({ message: "Please fill all fields" });

  let users = JSON.parse(req.body.users);
  if (users.length < 2)
    return res
      .status(400)
      .json({ message: "Group chat requires more than 2 users" });

  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Rename group chat
// @route PUT /api/chats/group/rename
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!updatedChat) return res.status(404).json({ message: "Chat not found" });
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add user to group
// @route PUT /api/chats/group/add
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!added) return res.status(404).json({ message: "Chat not found" });
    res.json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Remove user from group
// @route PUT /api/chats/group/remove
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!removed) return res.status(404).json({ message: "Chat not found" });
    res.json(removed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
