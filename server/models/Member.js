const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  score: { type: Number, required: true },
  archetype: { type: String, required: true },
  percentile: { type: String, required: true },
  history: { type: String, required: true },
  alignment: { type: String, required: true },
  scores: {
    innovation: { type: Number, required: true },
    risk: { type: Number, required: true },
    community: { type: Number, required: true },
    financial: { type: Number, required: true },
    participation: { type: Number, required: true },
    focus: { type: Number, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);
