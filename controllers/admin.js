const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.approveAgent = async (req, res) => {
  const { agentId } = req.body;

  try {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== "agent") {
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

    if (!agent || agent.role !== "agent") {
      return res.status(404).send({ message: "Agent not found" });
    }

    agent.balance += amount;
    await agent.save();

    res
      .status(200)
      .send({ message: "Money added to agent's account successfully" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

// get agents of pending add money request
exports.getPendingAddMoneyRequests = async (req, res) => {
  try {
    const agentsWithPendingRequests = await User.find({
      role: "agent",
      "rechargeRequests.status": "pending",
    });
    res.status(200).send(agentsWithPendingRequests);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.approveMoneyRequest = async (req, res) => {
  const { agentId, requestId } = req.body;

  try {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== "agent") {
      return res.status(404).send({ message: "Agent not found" });
    }
    const request = agent.rechargeRequests.id(requestId);

    if (!request || request.status !== "pending") {
      return res.status(400).send({ message: "Invalid or already processed request" });
    }

    console.log(request);
    

    agent.balance += request.amount;
    request.status = "approved";
    await agent.save();

    res.status(200).send({ message: "Money request approved successfully" });
  } catch (error) {
    console.error("Error in approveMoneyRequest:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getPendingAgents = async (req, res) => {
  try {
    const pendingAgents = await User.find({ role: "agent", isApproved: false });
    res.status(200).send(pendingAgents);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate(
      "sender receiver",
      "name mobile"
    );
    res.status(200).send(transactions);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getPendingAgents = async (req, res) => {
  try {
    const pendingAgents = await User.find({
      role: "agent",
      isApproved: false,
    });
    res.status(200).send(pendingAgents);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.approveWithdrawalRequest = async (req, res) => {
  const { agentId, withdrawId, action } = req.body;

  try {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== "agent") {
      return res.status(404).send({ message: "Agent not found" });
    }
    const request = agent.requestWithDraw.id(withdrawId);

    if (!request) {
      return res.status(404).send({ message: "Withdrawal request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).send({ message: "Request already processed" });
    }

    if (action === "approve") {
      if (agent.agent_income < request.amount) {
        return res.status(400).send({ message: "Insufficient agent income" });
      }
      agent.agent_income -= request.amount;
      // agent.balance += request.amount;
      const transaction = new Transaction({
        sender: agentId,
        receiver: agentId,
        amount: request.amount,
        type: "agent-withdraw",
      });
      await transaction.save();
      agent.transactions.push(transaction._id);
      request.status = "approved";
    } else if (action === "reject") {
      request.status = "rejected";
    } else {
      return res.status(400).send({ message: "Invalid action" });
    }

    await agent.save();

    res
      .status(200)
      .send({ message: `Withdrawal request ${action}d successfully` });
  } catch (err) {
    console.error("Error in approveWithdrawalRequest:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getAdminUserTransactions = async (req, res) => {
  const { userId } = req.params;
  try {
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender receiver", "name mobile")
      .sort({ timestamp: -1 });
    res.status(200).send(transactions);
  } catch (err) {
    console.error("Error in getUserTransactions:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};
