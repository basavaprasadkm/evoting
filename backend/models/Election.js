const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  party: { type: String, required: true, trim: true },
  partySymbol: { type: String, default: '🗳️' },
  constituency: { type: String, required: true },
  manifesto: { type: String, default: '' },
  photo: { type: String, default: null },
  voteCount: { type: Number, default: 0 }
});

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true
  },
  description: { type: String, trim: true },
  electionType: {
    type: String,
    enum: ['General', 'State', 'Local', 'By-Election'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  candidates: [candidateSchema],
  constituencies: [{ type: String }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  totalVotes: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update status based on dates
electionSchema.methods.updateStatus = function() {
  const now = new Date();
  if (now < this.startDate) this.status = 'upcoming';
  else if (now >= this.startDate && now <= this.endDate) this.status = 'active';
  else if (now > this.endDate) this.status = 'completed';
};

electionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.updateStatus();
  next();
});

module.exports = mongoose.model('Election', electionSchema);
