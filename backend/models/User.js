const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    phone: String,
    occupation: String,
    monthlyIncome: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    financialGoalSummary: String,
    avatar: String
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
