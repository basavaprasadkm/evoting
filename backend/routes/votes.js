const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Voter = require('../models/Voter');
const { protect, requireFaceRegistered } = require('../middleware/auth');

// @route POST /api/votes/cast
// @desc  Cast a vote (requires face verification token)
router.post('/cast', protect, requireFaceRegistered, async (req, res) => {
  try {
    const { electionId, candidateId, faceToken } = req.body;

    if (!electionId || !candidateId || !faceToken) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Verify face token (must be valid and recent)
    let facePayload;
    try {
      facePayload = jwt.verify(faceToken, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ 
        success: false, 
        message: 'Face verification expired. Please verify your face again.' 
      });
    }

    if (!facePayload.faceVerified || facePayload.id !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Invalid face verification.' });
    }

    // Get election
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });
    if (election.status !== 'active') {
      return res.status(400).json({ success: false, message: `Election is ${election.status}.` });
    }

    // Check if candidate exists
    const candidate = election.candidates.id(candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found.' });

    // Check if voter already voted
    const voter = await Voter.findById(req.user._id);
    if (voter.hasVotedIn(electionId)) {
      return res.status(400).json({ success: false, message: 'You have already voted in this election.' });
    }

    // Get chain's latest hash
    const previousHash = await Vote.getLatestHash(electionId);

    // Create anonymous vote token
    const voteToken = uuidv4();
    const ipHash = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex');

    // Record vote
    const vote = await Vote.create({
      voteToken,
      electionId,
      candidateId,
      constituency: voter.constituency,
      previousHash,
      faceVerified: true,
      faceVerificationScore: facePayload.distance 
        ? Math.round((1 - facePayload.distance / 0.6) * 100) 
        : 95,
      ipHash
    });

    // Update candidate count & total votes
    await Election.updateOne(
      { _id: electionId, 'candidates._id': candidateId },
      { 
        $inc: { 
          'candidates.$.voteCount': 1,
          totalVotes: 1
        }
      }
    );

    // Record that this voter voted (without storing which candidate)
    await Voter.findByIdAndUpdate(req.user._id, {
      $push: { hasVoted: { electionId } }
    });

    res.json({
      success: true,
      message: '🗳️ Your vote has been cast successfully and recorded securely!',
      receiptToken: vote.voteToken,
      voteHash: vote.currentHash,
      timestamp: vote.timestamp
    });

  } catch (err) {
    console.error('Vote cast error:', err);
    res.status(500).json({ success: false, message: 'Error casting vote.' });
  }
});

// @route GET /api/votes/my-votes
// @desc  Get voter's voting history (no candidate data - anonymous)
router.get('/my-votes', protect, async (req, res) => {
  try {
    const voter = await Voter.findById(req.user._id).populate('hasVoted.electionId', 'title electionType status');
    res.json({ 
      success: true, 
      votingHistory: voter.hasVoted
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/votes/verify/:token
// @desc  Verify a vote receipt
router.get('/verify/:token', protect, async (req, res) => {
  try {
    const vote = await Vote.findOne({ voteToken: req.params.token })
      .populate('electionId', 'title status');
    
    if (!vote) {
      return res.status(404).json({ success: false, message: 'Vote receipt not found.' });
    }

    res.json({
      success: true,
      verified: true,
      vote: {
        receiptToken: vote.voteToken,
        election: vote.electionId,
        constituency: vote.constituency,
        timestamp: vote.timestamp,
        hash: vote.currentHash,
        faceVerified: vote.faceVerified
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
