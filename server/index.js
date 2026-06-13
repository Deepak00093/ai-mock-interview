const interviewRoutes = require('./routes/interviewRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON data from the frontend

// Import Routes
const authRoutes = require('./routes/authRoutes');

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);

// Basic Test Route
app.get('/', (req, res) => {
  res.send('InterviewIQ API is running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});