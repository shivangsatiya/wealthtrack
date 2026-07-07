require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Habit = require('./models/Habit');
const Goal = require('./models/Goal');
const Wealth = require('./models/Wealth');

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  // Clear existing data
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Habit.deleteMany({});
  await Goal.deleteMany({});
  await Wealth.deleteMany({});
  console.log('Cleared existing data');

  // Create admin user
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const admin = await User.create({
    name: 'Shivang Satiya',
    email: 'admin@wealthtrack.com',
    password: adminPass,
    role: 'admin',
    profile: {
      phone: '+91 9876543210',
      occupation: 'Software Engineer',
      monthlyIncome: 85000,
      currency: 'INR',
      financialGoalSummary: 'Build an emergency fund, invest in mutual funds, and save for a home down payment by 2027.'
    }
  });
  console.log('Admin created:', admin.email);

  // Create regular users
  const userPass = await bcrypt.hash('User@123', 12);
  const user1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: userPass,
    role: 'user',
    profile: {
      phone: '+91 9845123456',
      occupation: 'Freelancer',
      monthlyIncome: 55000,
      currency: 'INR',
      financialGoalSummary: 'Save ₹3L for vacation and build a 6-month emergency fund.'
    }
  });

  const user2 = await User.create({
    name: 'Rohan Mehta',
    email: 'rohan@example.com',
    password: userPass,
    role: 'user',
    profile: {
      phone: '+91 9123456789',
      occupation: 'Business Owner',
      monthlyIncome: 120000,
      currency: 'INR',
      financialGoalSummary: 'Expand business savings, invest in stocks and gold.'
    }
  });

  const user3 = await User.create({
    name: 'Ananya Patel',
    email: 'ananya@example.com',
    password: userPass,
    role: 'user',
    profile: {
      phone: '+91 9988776655',
      occupation: 'Student',
      monthlyIncome: 15000,
      currency: 'INR',
      financialGoalSummary: 'Build saving habits early and save for higher education.'
    }
  });
  console.log('Users created');

  // ---- TRANSACTIONS for admin (Shivang) ----
  const now = new Date();
  const txData = [];

  // Last 6 months of transactions
  for (let m = 5; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);

    // Income
    txData.push({ user: admin._id, type: 'income', amount: 85000, category: 'Salary', description: 'Monthly salary - TechCorp India', date: new Date(month.getFullYear(), month.getMonth(), 1) });
    if (m % 2 === 0) txData.push({ user: admin._id, type: 'income', amount: 12000, category: 'Freelance', description: 'React project - client work', date: new Date(month.getFullYear(), month.getMonth(), 15) });

    // Expenses
    txData.push({ user: admin._id, type: 'expense', amount: 18000, category: 'Rent & Housing', description: 'Monthly rent - 2BHK Jaipur', date: new Date(month.getFullYear(), month.getMonth(), 2) });
    txData.push({ user: admin._id, type: 'expense', amount: 6500, category: 'Food & Dining', description: 'Groceries + dining out', date: new Date(month.getFullYear(), month.getMonth(), 5) });
    txData.push({ user: admin._id, type: 'expense', amount: 2200, category: 'Transport', description: 'Fuel + Uber rides', date: new Date(month.getFullYear(), month.getMonth(), 8) });
    txData.push({ user: admin._id, type: 'expense', amount: 1500, category: 'Utilities', description: 'Electricity + internet bill', date: new Date(month.getFullYear(), month.getMonth(), 10) });
    txData.push({ user: admin._id, type: 'expense', amount: 3200, category: 'Shopping', description: 'Clothes + household items', date: new Date(month.getFullYear(), month.getMonth(), 14) });
    txData.push({ user: admin._id, type: 'expense', amount: 800, category: 'Personal Care', description: 'Gym membership', date: new Date(month.getFullYear(), month.getMonth(), 1) });
    txData.push({ user: admin._id, type: 'expense', amount: 1200, category: 'Entertainment', description: 'OTT subscriptions + movies', date: new Date(month.getFullYear(), month.getMonth(), 20) });
    if (m % 3 === 0) txData.push({ user: admin._id, type: 'expense', amount: 4500, category: 'Healthcare', description: 'Annual health checkup', date: new Date(month.getFullYear(), month.getMonth(), 22) });
  }

  // Transactions for user1 (Priya)
  for (let m = 3; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    txData.push({ user: user1._id, type: 'income', amount: 55000, category: 'Freelance', description: 'Design project payment', date: new Date(month.getFullYear(), month.getMonth(), 3) });
    txData.push({ user: user1._id, type: 'expense', amount: 12000, category: 'Rent & Housing', description: 'PG accommodation', date: new Date(month.getFullYear(), month.getMonth(), 2) });
    txData.push({ user: user1._id, type: 'expense', amount: 5000, category: 'Food & Dining', description: 'Monthly food expenses', date: new Date(month.getFullYear(), month.getMonth(), 10) });
    txData.push({ user: user1._id, type: 'expense', amount: 1800, category: 'Transport', description: 'Metro + auto', date: new Date(month.getFullYear(), month.getMonth(), 15) });
  }

  await Transaction.insertMany(txData);
  console.log('Transactions created:', txData.length);

  // ---- HABITS for admin ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habit1 = await Habit.create({
    user: admin._id,
    name: 'Save ₹500 Daily',
    description: 'Transfer ₹500 to savings account every morning before spending',
    frequency: 'daily',
    category: 'Saving',
    targetAmount: 500,
    streak: 14,
    longestStreak: 21,
    completions: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(today.getTime() - i * 86400000),
      note: 'Saved to SBI account',
      amountSaved: 500
    })),
    startDate: new Date(today.getTime() - 30 * 86400000)
  });

  const habit2 = await Habit.create({
    user: admin._id,
    name: 'Track All Expenses',
    description: 'Log every expense in WealthTrack before end of day',
    frequency: 'daily',
    category: 'Tracking',
    streak: 22,
    longestStreak: 22,
    completions: Array.from({ length: 22 }, (_, i) => ({
      date: new Date(today.getTime() - i * 86400000),
      note: 'All expenses logged'
    })),
    startDate: new Date(today.getTime() - 30 * 86400000)
  });

  const habit3 = await Habit.create({
    user: admin._id,
    name: 'Invest in Mutual Funds',
    description: 'SIP of ₹5000 every month in index fund',
    frequency: 'monthly',
    category: 'Investing',
    targetAmount: 5000,
    streak: 5,
    longestStreak: 5,
    completions: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(now.getFullYear(), now.getMonth() - i, 1),
      note: 'SIP auto-deducted',
      amountSaved: 5000
    })),
    startDate: new Date(now.getFullYear(), now.getMonth() - 5, 1)
  });

  const habit4 = await Habit.create({
    user: admin._id,
    name: 'Review Weekly Budget',
    description: 'Check spending vs budget every Sunday evening',
    frequency: 'weekly',
    category: 'Budgeting',
    streak: 8,
    longestStreak: 12,
    completions: Array.from({ length: 8 }, (_, i) => ({
      date: new Date(today.getTime() - i * 7 * 86400000),
      note: 'Budget reviewed, on track'
    })),
    startDate: new Date(today.getTime() - 60 * 86400000)
  });

  const habit5 = await Habit.create({
    user: admin._id,
    name: 'Read Financial News',
    description: 'Spend 15 mins reading Moneycontrol or Economic Times',
    frequency: 'daily',
    category: 'Learning',
    streak: 7,
    longestStreak: 15,
    completions: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(today.getTime() - i * 86400000),
      note: 'Read market news'
    })),
    startDate: new Date(today.getTime() - 45 * 86400000)
  });

  console.log('Habits created: 5');

  // ---- GOALS for admin ----
  const goal1 = await Goal.create({
    user: admin._id,
    title: 'Emergency Fund',
    description: '6 months of expenses as emergency buffer',
    targetAmount: 300000,
    savedAmount: 185000,
    deadline: new Date(2026, 11, 31),
    category: 'Emergency Fund',
    icon: '🛡️',
    contributions: [
      { amount: 50000, date: new Date(2026, 0, 15), note: 'Initial deposit' },
      { amount: 35000, date: new Date(2026, 1, 10), note: 'Bonus received' },
      { amount: 25000, date: new Date(2026, 2, 5), note: 'Monthly savings' },
      { amount: 30000, date: new Date(2026, 3, 8), note: 'Freelance income' },
      { amount: 25000, date: new Date(2026, 4, 12), note: 'Monthly savings' },
      { amount: 20000, date: new Date(2026, 5, 3), note: 'Monthly savings' },
    ]
  });

  const goal2 = await Goal.create({
    user: admin._id,
    title: 'Home Down Payment',
    description: '20% down payment for 2BHK in Jaipur',
    targetAmount: 1200000,
    savedAmount: 340000,
    deadline: new Date(2028, 5, 30),
    category: 'Home',
    icon: '🏠',
    contributions: [
      { amount: 100000, date: new Date(2025, 6, 1), note: 'Started saving' },
      { amount: 80000, date: new Date(2025, 9, 1), note: 'Q3 savings' },
      { amount: 90000, date: new Date(2026, 0, 1), note: 'Year end savings' },
      { amount: 70000, date: new Date(2026, 3, 1), note: 'Q1 2026' },
    ]
  });

  const goal3 = await Goal.create({
    user: admin._id,
    title: 'Goa Vacation',
    description: 'Family trip to Goa in December 2026',
    targetAmount: 80000,
    savedAmount: 80000,
    deadline: new Date(2026, 11, 15),
    category: 'Vacation',
    icon: '✈️',
    isCompleted: true,
    completedAt: new Date(2026, 5, 1),
    contributions: [
      { amount: 20000, date: new Date(2026, 1, 1), note: 'Started' },
      { amount: 30000, date: new Date(2026, 3, 1), note: 'Mid savings' },
      { amount: 30000, date: new Date(2026, 4, 15), note: 'Final amount' },
    ]
  });

  const goal4 = await Goal.create({
    user: admin._id,
    title: 'New Laptop',
    description: 'MacBook Pro M3 for development work',
    targetAmount: 180000,
    savedAmount: 95000,
    deadline: new Date(2026, 9, 1),
    category: 'Gadget',
    icon: '💻',
    contributions: [
      { amount: 40000, date: new Date(2026, 2, 1), note: 'Started' },
      { amount: 35000, date: new Date(2026, 4, 1), note: 'Monthly saving' },
      { amount: 20000, date: new Date(2026, 5, 15), note: 'Freelance income' },
    ]
  });

  console.log('Goals created: 4');

  // ---- WEALTH for admin ----
  await Wealth.create({
    user: admin._id,
    assets: [
      { name: 'SBI Savings Account', type: 'Savings Account', value: 185000 },
      { name: 'HDFC FD - 1 Year', type: 'Fixed Deposit', value: 250000 },
      { name: 'Zerodha - Stocks Portfolio', type: 'Stocks', value: 145000 },
      { name: 'Parag Parikh Flexi Cap Fund', type: 'Mutual Funds', value: 320000 },
      { name: 'Gold Sovereign Bonds', type: 'Gold', value: 95000 },
      { name: 'Cash in hand', type: 'Cash', value: 15000 },
    ],
    liabilities: [
      { name: 'HDFC Credit Card', type: 'Credit Card', amount: 18000 },
      { name: 'Education Loan - SBI', type: 'Education Loan', amount: 120000 },
    ],
    netWorthSnapshots: [
      { netWorth: 720000, totalAssets: 858000, totalLiabilities: 138000, recordedAt: new Date(2026, 0, 1) },
      { netWorth: 755000, totalAssets: 895000, totalLiabilities: 140000, recordedAt: new Date(2026, 1, 1) },
      { netWorth: 790000, totalAssets: 930000, totalLiabilities: 140000, recordedAt: new Date(2026, 2, 1) },
      { netWorth: 840000, totalAssets: 980000, totalLiabilities: 140000, recordedAt: new Date(2026, 3, 1) },
      { netWorth: 872000, totalAssets: 1010000, totalLiabilities: 138000, recordedAt: new Date(2026, 4, 1) },
      { netWorth: 892000, totalAssets: 1030000, totalLiabilities: 138000, recordedAt: new Date(2026, 5, 1) },
    ]
  });

  // Wealth for user1
  await Wealth.create({
    user: user1._id,
    assets: [
      { name: 'Kotak Savings Account', type: 'Savings Account', value: 85000 },
      { name: 'LIC Policy', type: 'Other', value: 120000 },
    ],
    liabilities: [
      { name: 'Personal Loan', type: 'Personal Loan', amount: 50000 },
    ],
    netWorthSnapshots: []
  });

  // Wealth for user2
  await Wealth.create({
    user: user2._id,
    assets: [
      { name: 'Business Current Account', type: 'Cash', value: 450000 },
      { name: 'Commercial Property', type: 'Real Estate', value: 3500000 },
      { name: 'Gold Jewellery', type: 'Gold', value: 280000 },
    ],
    liabilities: [
      { name: 'Business Loan - ICICI', type: 'Personal Loan', amount: 800000 },
    ],
    netWorthSnapshots: []
  });

  await Wealth.create({ user: user3._id, assets: [], liabilities: [], netWorthSnapshots: [] });

  console.log('Wealth data created');

  console.log('\n✅ Seed completed successfully!');
  console.log('─────────────────────────────────────');
  console.log('Admin login:  admin@wealthtrack.com  /  Admin@123');
  console.log('User 1 login: priya@example.com      /  User@123');
  console.log('User 2 login: rohan@example.com      /  User@123');
  console.log('User 3 login: ananya@example.com     /  User@123');
  console.log('─────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });