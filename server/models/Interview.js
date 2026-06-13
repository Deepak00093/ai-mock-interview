const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  totalScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);