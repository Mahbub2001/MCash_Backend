const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { name, mobile, email, pin, nid, role } = req.body;
  try {
    const user = new User({ name, mobile, email, pin, nid, role });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { mobile, pin } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (!user) throw new Error('User not found');
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};