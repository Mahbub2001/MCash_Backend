const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { name, mobile, email, pin, nid, role } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }, { nid }] });
    if (existingUser) {
      return res.status(400).send({ message: "Mobile, email, or NID already exists" });
    }
    const hashedPin = await bcrypt.hash(pin, 10);
    let balance = 0;
    if (role === 'user') {
      balance = 40; 
    } else if (role === 'agent') {
      balance = 100000;
    }
    const user = new User({
      name,
      mobile,
      email,
      pin: hashedPin,
      nid,
      role,
      balance,
      isApproved: role === 'user' 
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).send({ message: "Registration successful", token });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { mobile, pin } = req.body;

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(400).send({ message: "Invalid credentials" });
    }
    if (user.token) {
      try {
        jwt.verify(user.token, process.env.JWT_SECRET);
        return res.status(403).send({ message: "You are already logged in from another device" });
      } catch (err) {
        user.token = null;
      }
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    user.token = token;
    await user.save();

    res.status(200).send({ message: "Login successful", token });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  const userId = req.decoded.id;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.token = null;
    await user.save();

    res.status(200).send({ message: "Logout successful" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};