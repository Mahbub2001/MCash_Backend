const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.approveAgent = async (req, res) => {
  const { agentId } = req.body;

  try {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== 'agent') {
      return res.status(404).send({ message: "Agent not found" });
    }

    agent.isApproved = true;
    await agent.save();

    res.status(200).send({ message: "Agent approved successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.blockUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.isBlocked = true; 
    await user.save();

    res.status(200).send({ message: "User blocked successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.addMoneyToAgent = async (req, res) => {
  const { agentId, amount } = req.body;

  try {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== 'agent') {
      return res.status(404).send({ message: "Agent not found" });
    }

    agent.balance += amount;
    await agent.save();

    res.status(200).send({ message: "Money added to agent's account successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getPendingAgents = async (req, res) => {
  try {
    const pendingAgents = await User.find({ role: 'agent', isApproved: false });
    res.status(200).send(pendingAgents);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('sender receiver', 'name mobile');
    res.status(200).send(transactions);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};