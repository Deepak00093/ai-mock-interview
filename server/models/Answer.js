const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answerText: { type: String, required: true },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: 'Pending AI Evaluation' },
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);