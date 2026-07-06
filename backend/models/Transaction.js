const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: [
      // Expense categories
      'Food & Dining', 'Transport', 'Rent & Housing', 'Entertainment',
      'Shopping', 'Healthcare', 'Education', 'Utilities', 'Personal Care', 'Other Expense',
      // Income categories
      'Salary', 'Freelance', 'Investment Returns', 'Business', 'Gift', 'Other Income'
    ]
  },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  tags: [String]
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
