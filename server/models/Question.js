const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  role: { type: String, required: true },
  questionText: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String }, // e.g., 'React', 'Arrays', 'APIs'
});

module.exports = mongoose.model('Question', questionSchema);