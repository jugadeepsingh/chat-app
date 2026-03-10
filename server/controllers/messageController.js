const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc  Send a message
// @route POST /api/messages
const sendMessage = async (req, res) => {
  const { content, chatId, fileUrl, fileType } = req.body;
  if (!chatId)
    return res.status(400).json({ message: "chatId is required" });

  try {
    let message = await Message.create({
      sender: req.user._id,
      content: content || "",
      chat: chatId,
      fileUrl: fileUrl || "",
      fileType: fileType || "",
    });

    message = await message.populate("sender", "name image email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name image email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all messages in a chat
// @route GET /api/messages/:chatId
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name image email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages };
