const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  adminFee: { 
    type: Number, 
    default: 0 
  },
  agentFee: { 
    type: Number, 
    default: 0 
  },
  type: { 
    type: String, 
    enum: ['send', 'cash-in', 'cash-out', 'agent-income'], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);