const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: String, required: true },
  votesYes: { type: Number, default: 0 },
  votesNo: { type: Number, default: 0 },
  status: { type: String, required: true, enum: ['Active', 'In Review', 'Passed', 'Executed'] },
  closesIn: { type: String, default: 'Expired' },
  reputationEffect: { type: String, default: '+0 VP' },
  proposalIndex: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
