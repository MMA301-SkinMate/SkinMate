const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentPlan', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    note: { type: String, default: '', trim: true, maxlength: 1000 },
    planPayload: { type: Array, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityPost', communityPostSchema);
