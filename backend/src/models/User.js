const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    googleSubject: {
      type: String,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
    },
    googleExchangeCodeHash: {
      type: String,
      default: null,
    },
    googleExchangeCodeExpiresAt: {
      type: Date,
      default: null,
    },
    skinProfile: {
      skinType: {
        type: String,
        default: null,
      },
      allergies: {
        type: [String],
        default: [],
      },
      currentConcerns: {
        type: [String],
        default: [],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { googleSubject: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('User', userSchema);