const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Voter = require("../models/Voter");
const { protect } = require("../middleware/auth");

// Generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route POST /api/auth/register
// @desc  Register new voter
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, constituency, aadharNumber } =
      req.body;

    // Validate age (must be 18+)
    const age = Math.floor(
      (new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000),
    );
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "You must be 18 or older to register.",
      });
    }

    // Check existing
    const existingEmail = await Voter.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    const existingAadhar = await Voter.findOne({ aadharNumber });
    if (existingAadhar) {
      return res
        .status(400)
        .json({ success: false, message: "Aadhar number already registered." });
    }

    // Generate unique voter ID
    const voterId = `VOTER-${uuidv4().substring(0, 8).toUpperCase()}`;

    const voter = await Voter.create({
      voterId,
      name,
      email,
      password,
      dateOfBirth,
      constituency,
      aadharNumber,
    });

    const token = signToken(voter._id);

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please register your face to complete setup.",
      token,
      voter: {
        id: voter._id,
        voterId: voter.voterId,
        name: voter.name,
        email: voter.email,
        constituency: voter.constituency,
        isFaceRegistered: voter.isFaceRegistered,
        role: voter.role,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(". ") });
    }
    console.error("Register error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
});

// @route POST /api/auth/login
// @desc  Login voter
router.post("/login", async (req, res) => {
  try {
    const { voterId, password } = req.body;

    if (!voterId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide Voter ID and password.",
      });
    }

    const voter = await Voter.findOne({
      $or: [
        { voterId: voterId.toUpperCase() },
        { email: voterId.toLowerCase() },
      ],
    }).select("+password");

    if (!voter || !(await voter.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    if (!voter.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account deactivated. Contact admin.",
      });
    }

    voter.lastLogin = new Date();
    voter.loginAttempts = 0;
    await voter.save({ validateBeforeSave: false });

    const token = signToken(voter._id);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      voter: {
        id: voter._id,
        voterId: voter.voterId,
        name: voter.name,
        email: voter.email,
        constituency: voter.constituency,
        isFaceRegistered: voter.isFaceRegistered,
        isVerified: voter.isVerified,
        role: voter.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
});

// @route POST /api/auth/register-face
// @desc  Save face descriptor for voter
router.post("/register-face", protect, async (req, res) => {
  try {
    const { faceDescriptor, faceImage } = req.body;

    if (
      !faceDescriptor ||
      !Array.isArray(faceDescriptor) ||
      faceDescriptor.length !== 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid face descriptor. Please try again with better lighting.",
      });
    }

    await Voter.findByIdAndUpdate(req.user._id, {
      faceDescriptor,
      faceImage,
      isFaceRegistered: true,
      isVerified: true,
    });

    res.json({
      success: true,
      message: "Face registered successfully! You can now vote.",
    });
  } catch (err) {
    console.error("Face register error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error saving face data." });
  }
});

// @route POST /api/auth/verify-face
// @desc  Verify face for voting authentication
router.post("/verify-face", protect, async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res
        .status(400)
        .json({ success: false, message: "No face descriptor provided." });
    }

    const voter = await Voter.findById(req.user._id);

    if (!voter.isFaceRegistered || !voter.faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Face not registered. Please register your face first.",
      });
    }

    // Compute Euclidean distance between descriptors
    const storedDescriptor = voter.faceDescriptor;
    let distance = 0;
    for (let i = 0; i < 128; i++) {
      distance += Math.pow(faceDescriptor[i] - storedDescriptor[i], 2);
    }
    distance = Math.sqrt(distance);

    // Threshold: < 0.6 is a match (face-api.js standard)
    const THRESHOLD = 0.6;
    const isMatch = distance < THRESHOLD;
    const confidence = Math.max(
      0,
      Math.min(100, Math.round((1 - distance / THRESHOLD) * 100)),
    );

    if (isMatch) {
      // Generate a short-lived face verification token
      const faceToken = jwt.sign(
        { id: voter._id, faceVerified: true, distance },
        process.env.JWT_SECRET,
        { expiresIn: "60m" }, // Valid for 60 minutes
      );

      res.json({
        success: true,
        verified: true,
        confidence,
        message: `Face verified (${confidence}% match). You may now cast your vote.`,
        faceToken,
      });
    } else {
      res.status(401).json({
        success: false,
        verified: false,
        confidence,
        message: `Face verification failed (${confidence}% match). Please try again.`,
      });
    }
  } catch (err) {
    console.error("Face verify error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error during face verification." });
  }
});

// @route GET /api/auth/me
// @desc  Get current user
router.get("/me", protect, async (req, res) => {
  const voter = await Voter.findById(req.user._id);
  res.json({ success: true, voter });
});

module.exports = router;
