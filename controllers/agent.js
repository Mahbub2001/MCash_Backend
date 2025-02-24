const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.cashIn = async (req, res) => {
  const { userPhone, amount, agentPin } = req.body;
  const agentId = req.decoded.id;

  try {
    const agent = await User.findById(agentId);
    const user = await User.findOne({ mobile: userPhone });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isPinValid = await bcrypt.compare(agentPin, agent.pin);
    if (!isPinValid) {
      return res.status(400).send({ message: "Invalid PIN" });
    }

    if (agent.balance < amount) {
      return res.status(400).send({ message: "Insufficient balance in agent's account" });
    }

    agent.balance -= amount;
    await agent.save();

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      sender: agentId,
      receiver: user._id,
      amount,
      type: 'cash-in'
    });
    await transaction.save();

    res.status(200).send({ message: "Cash-in successful" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.requestRecharge = async (req, res) => {
  const { amount } = req.body;
  const agentId = req.decoded.id;

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
  const agentId = req.decoded.id;

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