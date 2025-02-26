const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');

exports.sendMoney = async (req, res) => {
  const { receiverPhone, amount, pin } = req.body;
  const senderId = req.decoded.id;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ mobile: receiverPhone });
    const admin = await User.findOne({ role: 'admin' });

    if (!receiver) {
      return res.status(404).send({ message: "Receiver not found" });
    }

    const isPinValid = await bcrypt.compare(pin, sender.pin);
    if (!isPinValid) {
      return res.status(400).send({ message: "Invalid PIN" });
    }

    if (sender.balance < amount) {
      return res.status(400).send({ message: "Insufficient balance" });
    }
    let fee = 0;
    if (amount > 100) {
      fee = 5;
    }
    sender.balance -= (amount + fee);
    await sender.save();
    receiver.balance += amount;
    await receiver.save();

    if (admin) {
      admin.balance += fee;
      await admin.save();
    }

    const transaction = new Transaction({
      sender: senderId,
      receiver: receiver._id,
      amount,
      fee,
      type: 'send'
    });
    await transaction.save();

    res.status(200).send({ message: "Money sent successfully", transaction });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.cashOut = async (req, res) => {
  const { agentPhone, amount, pin } = req.body;
  const userId = req.decoded.id;

  try {
    const user = await User.findById(userId);
    const agent = await User.findOne({ mobile: agentPhone, role: 'agent' });
    const admin = await User.findOne({ role: 'admin' });

    if (!agent) {
      return res.status(404).send({ message: "Agent not found" });
    }
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(400).send({ message: "Invalid PIN" });
    }
    if (user.balance < amount) {
      return res.status(400).send({ message: "Insufficient balance" });
    }
    const fee = amount * 0.015;
    user.balance -= (amount + fee);
    await user.save();
    agent.balance += amount;
    await agent.save();

    if (admin) {
      admin.balance += fee;
      await admin.save();
    }
    const transaction = new Transaction({
      sender: userId,
      receiver: agent._id,
      amount,
      fee,
      type: 'cash-out'
    });
    await transaction.save();

    res.status(200).send({ message: "Cash-out successful", transaction });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};
exports.getBalance = async (req, res) => {
  const userId = req.decoded.id;

  try {
    const user = await User.findById(userId).select('balance -_id');
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};
exports.getTransactionHistory = async (req, res) => {
  const userId = req.decoded.id;

  try {
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender receiver', 'name mobile')
      .sort({ timestamp: -1 })
      .limit(100); 

    res.status(200).send(transactions);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};