// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  date: String
});

module.exports = mongoose.model('Task', TaskSchema);
