const { sequelize } = require('../config/db');
const User    = require('./User');
const Chat    = require('./Chat');
const Message = require('./Message');

// Users ↔ Chats (many-to-many) — explicit foreign keys
const ChatUsers = sequelize.define('ChatUsers', {}, { timestamps: false });

User.belongsToMany(Chat, { 
  through: ChatUsers, 
  as: 'chats',
  foreignKey: 'userId',
  otherKey: 'chatId'
});

Chat.belongsToMany(User, { 
  through: ChatUsers, 
  as: 'users',
  foreignKey: 'chatId',
  otherKey: 'userId'
});

// Messages
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });
Chat.hasMany(Message, { foreignKey: 'chatId' });

module.exports = { User, Chat, Message, ChatUsers };