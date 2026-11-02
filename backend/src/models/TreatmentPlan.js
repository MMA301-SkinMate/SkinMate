const mongoose = require('mongoose');

const planStepSchema = new mongoose.Schema(
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
    category: {
      type: String,
      default: 'others',
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
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: String,
      default: null,
    },
    brand: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

const planDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
    },
    focus: {
      type: String,
      default: 'Chăm sóc toàn diện',
    },
    steps: {
      type: [planStepSchema],
      default: [],
    },
  },
  { _id: true }
);

const treatmentPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    targetSkinTypes: {
      type: [String],
      default: [],
    },
    targetConcerns: {
      type: [String],
      default: [],
    },
    totalDays: {
      type: Number,
      required: true,
      default: 14,
    },
    currentDay: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['template', 'active', 'paused', 'completed'],
      default: 'active',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    days: {
      type: [planDaySchema],
      default: [],
    },
    historyOverrides: {
      type: [
        {
          date: String,
          dayNumber: Number,
          reason: String,
          conditions: [String],
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

treatmentPlanSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);

