const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  targetAmount: { type: Number, required: true, min: 1 },
  savedAmount: { type: Number, default: 0 },
  deadline: Date,
  category: {
    type: String,
    enum: ['Emergency Fund', 'Vacation', 'Education', 'Vehicle', 'Home', 'Retirement', 'Gadget', 'Other'],
    default: 'Other'
  },
  contributions: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    note: String
  }],
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  icon: { type: String, default: '🎯' }
}, { timestamps: true });

goalSchema.virtual('progressPercent').get(function () {
  return Math.min(100, Math.round((this.savedAmount / this.targetAmount) * 100));
});

module.exports = mongoose.model('Goal', goalSchema);
