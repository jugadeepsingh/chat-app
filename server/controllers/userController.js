const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const exists = await User.findOne({ where: { email } });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      pic,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      status: user.status,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        status: user.status,
        token: generateToken(user.id),
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search || "";

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
        ],
      },
      attributes: ["id", "name", "email", "pic", "status"],
    });

    return res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({
      message: "User search failed",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.status = req.body.status || user.status;
    user.pic = req.body.pic || user.pic;

    await user.save();

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      status: user.status,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
};