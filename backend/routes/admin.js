const express = require('express');
const router = express.Router();
const Voter = require('../models/Voter');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @route GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalVoters, registeredFaces, activeElections, totalVotes] = await Promise.all([
      Voter.countDocuments({ role: 'voter' }),
      Voter.countDocuments({ isFaceRegistered: true }),
      Election.countDocuments({ status: 'active' }),
      Vote.countDocuments()
    ]);

    const recentElections = await Election.find().sort({ createdAt: -1 }).limit(5);
    const recentVoters = await Voter.find({ role: 'voter' }).sort({ createdAt: -1 }).limit(10)
      .select('name email voterId constituency isFaceRegistered createdAt');

    res.json({
      success: true,
      stats: { totalVoters, registeredFaces, activeElections, totalVotes },
      recentElections,
      recentVoters
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/admin/voters
router.get('/voters', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'voter' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { voterId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const voters = await Voter.find(query)
      .select('-password -faceDescriptor -faceImage')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Voter.countDocuments(query);
    res.json({ success: true, voters, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/admin/seed-election
// @desc  Seed a sample election for demo
router.post('/seed-election', async (req, res) => {
  try {
    const existing = await Election.findOne({ title: 'Demo General Election 2024' });
    if (existing) return res.json({ success: true, message: 'Demo election already exists.', election: existing });

    const election = await Election.create({
      title: 'Demo General Election 2024',
      description: 'A demonstration election for testing the e-voting system.',
      electionType: 'General',
      startDate: new Date(Date.now() - 1000 * 60 * 60), // started 1 hour ago
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // ends in 7 days
      status: 'active',
      constituencies: [],
      candidates: [
        { name: 'Ravi Kumar', party: 'Progressive Party', partySymbol: '🌟', constituency: 'All', manifesto: 'Development and Prosperity' },
        { name: 'Priya Sharma', party: 'Unity Alliance', partySymbol: '🤝', constituency: 'All', manifesto: 'Education and Healthcare' },
        { name: 'Arjun Patel', party: 'Green Future', partySymbol: '🌿', constituency: 'All', manifesto: 'Environment and Sustainability' },
        { name: 'Meena Reddy', party: 'Digital India Party', partySymbol: '💻', constituency: 'All', manifesto: 'Technology and Innovation' }
      ],
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, election });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/voters/:id/toggle
router.put('/voters/:id/toggle', async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ success: false, message: 'Voter not found.' });
    voter.isActive = !voter.isActive;
    await voter.save({ validateBeforeSave: false });
    res.json({ success: true, message: `Voter ${voter.isActive ? 'activated' : 'deactivated'}.`, voter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// @route POST /api/admin/create-election
router.post('/create-election', async (req, res) => {
  try {
    const { title, description, electionType, startDate, endDate, constituencies, candidates } = req.body;

    if (!title || !electionType || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Title, type, start and end date are required.' });
    }

    const election = await Election.create({
      title,
      description,
      electionType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      constituencies: constituencies || [],
      candidates: candidates || [],
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Election created!', election });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports = router;
