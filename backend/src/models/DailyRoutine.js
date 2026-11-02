const mongoose = require('mongoose');

const dailyStepSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    stepKey: {
      type: String,
      enum: ['cleanse', 'tone', 'treat', 'moisturize', 'protect'],
      required: true,
    },
    stepName: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productIcon: {
      type: String,
      default: 'serum',
    },
    productImageUrl: {
      type: String,
      default: null,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: String,
      default: null,
    },
    dynamicReason: {
      type: String,
      default: null,
    },
    isExternalRecommendation: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const dailyRoutineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    checkIn: {
      status: {
        type: [String],
        default: [],
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentPlan',
      default: null,
    },
    planTitle: {
      type: String,
      default: null,
    },
    dayNumber: {
      type: Number,
      default: 1,
    },
    isOverridden: {
      type: Boolean,
      default: false,
    },
    overrideReason: {
      type: String,
      default: null,
    },
    steps: {
      type: [dailyStepSchema],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

dailyRoutineSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyRoutine', dailyRoutineSchema);

