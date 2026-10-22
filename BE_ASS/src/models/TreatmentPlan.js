const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true }, // 1: Làm sạch, 2: Toner, 3: Đặc trị, 4: Dưỡng ẩm, 5: Chống nắng
  stepType: { type: String, required: true }, // cleanser, toner, treatment, moisturizer, sunscreen
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'MyCollection', default: null },
  productName: { type: String, required: true },
  targetActiveIngredient: { type: String }, // Hoạt chất chủ đạo (VD: BHA 2%, Niacinamide, B5)
  isExternalSuggestion: { type: Boolean, default: false }, // true nếu sản phẩm gợi ý ngoài tủ đồ
  usageNote: { type: String },
});

const routineDaySchema = new mongoose.Schema({
  dayIndex: { type: Number, required: true }, // Ngày thứ 1, 2, ...
  morning: [stepSchema],
  evening: [stepSchema],
});

const treatmentPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetConcern: {
      type: String, // Ví dụ: "Trị mụn", "Căng bóng cấp ẩm", "Phục hồi da"
      default: 'Căng bóng cấp ẩm',
    },
    durationDays: {
      type: Number,
      default: 7,
    },
    planPayload: [routineDaySchema],
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'canceled'],
      default: 'draft',
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);