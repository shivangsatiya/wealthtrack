const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: String,
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  category: {
    type: String,
    enum: ['Saving', 'Budgeting', 'Investing', 'Tracking', 'Learning'],
    required: true
  },
  targetAmount: { type: Number, default: 0 }, // optional monetary target per completion
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completions: [{
    date: { type: Date, required: true },
    note: String,
    amountSaved: Number
  }],
  isActive: { type: Boolean, default: true },
  reminderTime: String, // e.g. "09:00"
  startDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
