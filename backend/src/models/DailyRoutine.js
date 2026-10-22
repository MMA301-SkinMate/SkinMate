const mongoose = require('mongoose');

const routineStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  stepName: {
    type: String,
    required: true, // Ví dụ: 'Làm sạch', 'Cân bằng', 'Đặc trị', 'Dưỡng / Phục hồi', 'Bảo vệ'
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
    default: '', // Dynamic AI reason sinh ra từ tình trạng check-in hôm nay
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const dailyRoutineSchema = new mongoose.Schema(
  {
    user: {
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
    skinConditions: {
      type: [String],
      default: ['Bình thường'],
    },
    undoExpiresAt: {
      type: Date,
      default: null,
    },
    morningSteps: {
      type: [routineStepSchema],
      default: [],
    },
    eveningSteps: {
      type: [routineStepSchema],
      default: [],
    },
    treatmentPlanRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentPlan',
      default: null,
    },
    dayInPlan: {
      type: Number,
      default: 1,
    },
    isOverridden: {
      type: Boolean,
      default: false,
    },
    overrideReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure 1 daily routine document per user per day
dailyRoutineSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyRoutine', dailyRoutineSchema);
