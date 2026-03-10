const { sequelize } = require('../config/db');
const User    = require('./User');
const Chat    = require('./Chat');
const Message = require('./Message');

// Users ↔ Chats (many-to-many)
const ChatUsers = sequelize.define('ChatUsers', {}, { timestamps: false });
User.belongsToMany(Chat, { through: ChatUsers, as: 'users' });
Chat.belongsToMany(User, { through: ChatUsers, as: 'users' });

// Messages
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });
Chat.hasMany(Message,   { foreignKey: 'chatId' });

module.exports = { User, Chat, Message, ChatUsers };