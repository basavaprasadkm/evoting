const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const voterSchema = new mongoose.Schema({
  voterId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  constituency: {
    type: String,
    required: true,
    trim: true
  },
  aadharNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{12}$/, 'Aadhar must be 12 digits']
  },
  // Facial recognition data — stored as base64 descriptor
  faceDescriptor: {
    type: [Number],
    default: null
  },
  faceImage: {
    type: String, // base64 or URL
    default: null
  },
  isFaceRegistered: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  hasVoted: [{
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
    votedAt: { type: Date, default: Date.now }
  }],
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
voterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
voterSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if voter has voted in a specific election
voterSchema.methods.hasVotedIn = function(electionId) {
  return this.hasVoted.some(v => v.electionId.toString() === electionId.toString());
};

// Virtual for age
voterSchema.virtual('age').get(function() {
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

module.exports = mongoose.model('Voter', voterSchema);
