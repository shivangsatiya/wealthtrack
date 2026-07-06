const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { name, description, frequency, category, targetAmount, reminderTime } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'name and category required' });

    const habit = await Habit.create({
      user: req.user._id, name, description, frequency, category, targetAmount, reminderTime
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/habits/:id/complete - mark a habit as done today
router.post('/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyDone = habit.completions.some(c => {
      const d = new Date(c.date); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    if (alreadyDone) return res.status(400).json({ message: 'Already completed today' });

    habit.completions.push({ date: new Date(), note: req.body.note, amountSaved: req.body.amountSaved });

    // Streak logic
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const doneYesterday = habit.completions.some(c => {
      const d = new Date(c.date); d.setHours(0, 0, 0, 0);
      return d.getTime() === yesterday.getTime();
    });
    habit.streak = doneYesterday ? habit.streak + 1 : 1;
    if (habit.streak > habit.longestStreak) habit.longestStreak = habit.streak;

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false }
    );
    if (!habit) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Habit removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
