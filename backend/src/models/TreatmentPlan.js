const mongoose = require('mongoose');

const planStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  stepName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['cleanser', 'toner', 'serum', 'treatment', 'moisturizer', 'sunscreen', 'other'],
    default: 'other',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null,
  },
  customProduct: {
    name: { type: String, default: '' },
    brand: { type: String, default: '' },
    icon: { type: String, default: 'bottle' },
    ingredients: { type: [String], default: [] },
  },
  isSuggestedOutside: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    default: '',
  },
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  morningSteps: {
    type: [planStepSchema],
    default: [],
  },
  eveningSteps: {
    type: [planStepSchema],
    default: [],
  },
});

const treatmentPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Tên chuỗi routine là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    targetSkinType: {
      type: String,
      default: 'Da_Hon_Hop',
    },
    targetCondition: {
      type: String,
      default: 'Nổi mụn',
    },
    totalDays: {
      type: Number,
      default: 14,
    },
    currentDay: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'cancelled'],
      default: 'active',
    },
    schedule: {
      type: [dayScheduleSchema],
      default: [],
    },
    isOverridden: {
      type: Boolean,
      default: false,
    },
    overrideHistory: [
      {
        date: { type: Date, default: Date.now },
        day: Number,
        triggerCondition: [String],
        originalProduct: String,
        replacedProduct: String,
        shiftDays: { type: Number, default: 1 },
        message: String,
      },
    ],
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
