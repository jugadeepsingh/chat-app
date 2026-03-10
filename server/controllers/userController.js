const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please fill all fields' });
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, pic });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, pic: user.pic, token: generateToken(user.id) });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ id: user.id, name: user.name, email: user.email, pic: user.pic, token: generateToken(user.id) });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

exports.searchUsers = async (req, res) => {
  const keyword = req.query.search || '';
  const users = await User.findAll({
    where: {
      id: { [Op.ne]: req.user.id },
      [Op.or]: [
        { name:  { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
      ],
    },
    attributes: ['id', 'name', 'email', 'pic'],
  });
  res.json(users);
};