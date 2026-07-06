const express = require('express');
const router = express.Router();
const Wealth = require('../models/Wealth');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/wealth
router.get('/', async (req, res) => {
  try {
    let wealth = await Wealth.findOne({ user: req.user._id });
    if (!wealth) wealth = await Wealth.create({ user: req.user._id });
    res.json(wealth);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/wealth/asset
router.post('/asset', async (req, res) => {
  try {
    const { name, type, value } = req.body;
    if (!name || !type || value === undefined)
      return res.status(400).json({ message: 'name, type, value required' });

    let wealth = await Wealth.findOne({ user: req.user._id });
    if (!wealth) wealth = await Wealth.create({ user: req.user._id });

    wealth.assets.push({ name, type, value });
    await snapshotNetWorth(wealth);
    await wealth.save();
    res.json(wealth);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/wealth/asset/:assetId
router.delete('/asset/:assetId', async (req, res) => {
  try {
    const wealth = await Wealth.findOne({ user: req.user._id });
    if (!wealth) return res.status(404).json({ message: 'Not found' });
    wealth.assets = wealth.assets.filter(a => a._id.toString() !== req.params.assetId);
    await snapshotNetWorth(wealth);
    await wealth.save();
    res.json(wealth);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/wealth/liability
router.post('/liability', async (req, res) => {
  try {
    const { name, type, amount } = req.body;
    if (!name || !type || amount === undefined)
      return res.status(400).json({ message: 'name, type, amount required' });

    let wealth = await Wealth.findOne({ user: req.user._id });
    if (!wealth) wealth = await Wealth.create({ user: req.user._id });

    wealth.liabilities.push({ name, type, amount });
    await snapshotNetWorth(wealth);
    await wealth.save();
    res.json(wealth);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/wealth/liability/:liabilityId
router.delete('/liability/:liabilityId', async (req, res) => {
  try {
    const wealth = await Wealth.findOne({ user: req.user._id });
    if (!wealth) return res.status(404).json({ message: 'Not found' });
    wealth.liabilities = wealth.liabilities.filter(l => l._id.toString() !== req.params.liabilityId);
    await snapshotNetWorth(wealth);
    await wealth.save();
    res.json(wealth);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function snapshotNetWorth(wealth) {
  const totalAssets = wealth.assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = wealth.liabilities.reduce((s, l) => s + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  wealth.netWorthSnapshots.push({ netWorth, totalAssets, totalLiabilities });
  // Keep last 50 snapshots
  if (wealth.netWorthSnapshots.length > 50)
    wealth.netWorthSnapshots = wealth.netWorthSnapshots.slice(-50);
}

module.exports = router;
