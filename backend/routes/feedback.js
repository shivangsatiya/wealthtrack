const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/feedback — user submits feedback
router.post('/', protect, async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    if (!type || !subject || !message)
      return res.status(400).json({ message: 'type, subject and message are required' });

    const feedback = await Feedback.create({
      user: req.user._id, type, subject, message
    });
    res.status(201).json(feedback);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/feedback/mine — user sees their own feedback
router.get('/mine', protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/feedback — admin sees all feedback
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/feedback/:id — admin updates status
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('user', 'name email');
    if (!feedback) return res.status(404).json({ message: 'Not found' });
    res.json(feedback);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;