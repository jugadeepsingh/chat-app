const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Chat = sequelize.define('Chat', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  chatName:        { type: DataTypes.STRING },
  isGroupChat:     { type: DataTypes.BOOLEAN, defaultValue: false },
  groupAdminId:    { type: DataTypes.UUID, allowNull: true },
  latestMessageId: { type: DataTypes.UUID, allowNull: true },
});

module.exports = Chat;