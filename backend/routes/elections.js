const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/elections
// @desc  Get all active elections for voter's constituency
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    // Auto-update statuses
    await Election.updateMany(
      { startDate: { $lte: now }, endDate: { $gte: now }, status: 'upcoming' },
      { $set: { status: 'active' } }
    );
    await Election.updateMany(
      { endDate: { $lt: now }, status: 'active' },
      { $set: { status: 'completed' } }
    );

    const elections = await Election.find({
      $or: [
        { constituencies: req.user.constituency },
        { constituencies: { $size: 0 } }, // national elections
        { electionType: 'General' }
      ]
    }).sort({ startDate: -1 });

    res.json({ success: true, elections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/elections/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });
    res.json({ success: true, election });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/elections/:id/results
router.get('/:id/results', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });

    // Only show results if completed or admin
    if (election.status !== 'completed' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Results will be available after the election ends.' 
      });
    }

    const results = election.candidates
      .sort((a, b) => b.voteCount - a.voteCount)
      .map((c, idx) => ({
        rank: idx + 1,
        name: c.name,
        party: c.party,
        partySymbol: c.partySymbol,
        constituency: c.constituency,
        voteCount: c.voteCount,
        percentage: election.totalVotes > 0 
          ? ((c.voteCount / election.totalVotes) * 100).toFixed(2) 
          : 0
      }));

    res.json({ 
      success: true, 
      results,
      totalVotes: election.totalVotes,
      winner: results[0] || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/elections - Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const election = await Election.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, election });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route PUT /api/elections/:id - Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!election) return res.status(404).json({ success: false, message: 'Election not found.' });
    res.json({ success: true, election });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
