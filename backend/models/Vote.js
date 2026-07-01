const mongoose = require("mongoose");
const crypto = require("crypto");

const voteSchema = new mongoose.Schema({
  voteToken: { type: String, required: true, unique: true },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  constituency: { type: String, required: true },
  previousHash: { type: String, required: true },
  currentHash: { type: String },
  faceVerified: { type: Boolean, default: false },
  faceVerificationScore: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  ipHash: { type: String },
  deviceFingerprint: { type: String },
});

voteSchema.pre("save", function (next) {
  const data = `${this.voteToken}${this.electionId}${this.candidateId}${this.timestamp}${this.previousHash}`;
  this.currentHash = crypto.createHash("sha256").update(data).digest("hex");
  next();
});

voteSchema.statics.getLatestHash = async function (electionId) {
  const latest = await this.findOne({ electionId }).sort({ timestamp: -1 });
  if (!latest) {
    return crypto
      .createHash("sha256")
      .update("GENESIS_BLOCK_EVOTING")
      .digest("hex");
  }
  return latest.currentHash;
};

module.exports = mongoose.model("Vote", voteSchema);
