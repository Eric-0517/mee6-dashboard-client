const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: String,
  answers: [String],
  timestamp: Date,
});

module.exports = mongoose.model('TestResult', testResultSchema);
