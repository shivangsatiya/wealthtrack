const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const Goal = require('../models/Goal');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalTransactions, totalHabits, totalGoals, completedGoals] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Habit.countDocuments({ isActive: true }),
      Goal.countDocuments(),
      Goal.countDocuments({ isCompleted: true })
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonth } });

    res.json({
      totalUsers, activeUsers, totalTransactions, totalHabits,
      totalGoals, completedGoals, newUsersThisMonth, recentUsers
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/admin/users/:id/toggle
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot suspend admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/activity
router.get('/activity', async (req, res) => {
  try {
    const monthlyActivity = await Transaction.aggregate([
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' }, type: '$type' },
          total: { $sum: '$amount' }, count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 24 }
    ]);
    res.json(monthlyActivity);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
