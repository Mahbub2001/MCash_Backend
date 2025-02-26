const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Transaction = require('../models/Transaction');

exports.cashIn = async (req, res) => {
  const { userPhone, amount, agentPin } = req.body;
  const agentId = req.decoded.userId;

  try {
    const agent = await User.findById(agentId);
    const user = await User.findOne({ mobile: userPhone });

    if (!user) {
      console.log("User not found");
      return res.status(404).send({ message: "User not found" });
    }

    console.log("Validating PIN...");
    const isPinValid = await bcrypt.compare(agentPin, agent.pin);
    if (!isPinValid) {
      console.log("Invalid PIN");
      return res.status(400).send({ message: "Invalid PIN" });
    }
    if (agent.balance < amount) {
      console.log("Insufficient balance in agent's account");
      return res.status(400).send({ message: "Insufficient balance in agent's account" });
    }

    console.log("Updating balances...");
    agent.balance -= amount;
    await agent.save();

    user.balance += amount;
    await user.save();

    console.log("Creating transaction...");
    const transaction = new Transaction({
      sender: agentId,
      receiver: user._id,
      amount,
      adminFee: 0, 
      agentFee: 0, 
      type: 'cash-in'
    });
    await transaction.save();

    console.log("Updating user and agent transactions...");
    user.transactions.push(transaction._id);
    await user.save();

    agent.transactions.push(transaction._id);
    await agent.save();

    console.log("Cash-in successful");
    res.status(200).send({ message: "Cash-in successful" });
  } catch (err) {
    console.error("Error in cashIn:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.requestRecharge = async (req, res) => {
  // const { amount } = req.body;
  const amount = 100000;
  const agentId = req.decoded.userId;  
  try {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== 'agent') {
      return res.status(404).send({ message: "Agent not found" });
    }

    agent.rechargeRequests.push({ amount, status: 'pending' });
    await agent.save();

    res.status(200).send({ message: "Recharge request submitted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getTransactionHistory = async (req, res) => {
  const agentId = req.decoded.userId;

  try {
    const transactions = await Transaction.find({ $or: [{ sender: agentId }, { receiver: agentId }] })
      .populate('sender receiver', 'name mobile')
      .sort({ timestamp: -1 })
      .limit(100); 

    res.status(200).send(transactions);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};