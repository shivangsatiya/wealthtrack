const mongoose = require('mongoose');

const wealthSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assets: [{
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Cash', 'Savings Account', 'Fixed Deposit', 'Stocks', 'Mutual Funds', 'Real Estate', 'Gold', 'Crypto', 'Other'],
      required: true
    },
    value: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  liabilities: [{
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Other'],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  netWorthSnapshots: [{
    netWorth: Number,
    totalAssets: Number,
    totalLiabilities: Number,
    recordedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Wealth', wealthSchema);
