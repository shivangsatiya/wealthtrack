const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/wealth', require('./routes/wealth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => res.json({ message: 'WealthTrack API running' }));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
