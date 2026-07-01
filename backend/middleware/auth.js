const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const voter = await Voter.findById(decoded.id).select('-password');
    
    if (!voter) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    
    if (!voter.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    }

    req.user = voter;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
};

const requireFaceRegistered = (req, res, next) => {
  if (!req.user.isFaceRegistered) {
    return res.status(403).json({ 
      success: false, 
      message: 'Please register your face before proceeding.',
      requiresFaceSetup: true
    });
  }
  next();
};

module.exports = { protect, adminOnly, requireFaceRegistered };
