const mongoose = require('mongoose');
const specialiteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String },
});
const Specialite = mongoose.model('Specialite', specialiteSchema);
module.exports = Specialite;