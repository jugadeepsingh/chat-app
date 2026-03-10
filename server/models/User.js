const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  pic:      { type: DataTypes.STRING, defaultValue: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg' },
});

module.exports = User;