const express = require('express');
const router = express.Router();
const Voter = require('../models/Voter');
const { protect } = require('../middleware/auth');

// @route GET /api/voters/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const voter = await Voter.findById(req.user._id)
      .select('-password -faceDescriptor')
      .populate('hasVoted.electionId', 'title status');
    res.json({ success: true, voter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/voters/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'constituency'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field]) updates[field] = req.body[field];
    });

    const voter = await Voter.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password -faceDescriptor');
    res.json({ success: true, voter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
