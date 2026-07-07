const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['General Feedback', 'Bug Report', 'Feature Request', 'Complaint', 'Other'],
    required: true
  },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved'],
    default: 'Pending'
  },
  adminNote: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);