const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, targetAmount, deadline, category, icon } = req.body;
    if (!title || !targetAmount) return res.status(400).json({ message: 'title and targetAmount required' });

    const goal = await Goal.create({
      user: req.user._id, title, description, targetAmount, deadline, category, icon
    });
    res.status(201).json(goal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/goals/:id/contribute
router.post('/:id/contribute', async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' });

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.contributions.push({ amount, note, date: new Date() });
    goal.savedAmount = Math.min(goal.targetAmount, goal.savedAmount + amount);

    if (goal.savedAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }
    await goal.save();
    res.json(goal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
