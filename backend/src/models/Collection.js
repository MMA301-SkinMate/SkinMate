const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    brand: {
      type: String,
      default: 'Chưa rõ',
      trim: true,
    },
    category: {
      type: String,
      enum: ['cleanser', 'toner', 'serum', 'treatment', 'moisturizer', 'sunscreen', 'other'],
      default: 'other',
    },
    icon: {
      type: String,
      default: 'bottle',
    },
    ingredients: {
      type: [String],
      default: [],
    },
    activeIngredients: {
      type: [String],
      default: [],
    },
    openedDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    periodAfterOpeningMonths: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'empty', 'expired', 'discarded'],
      default: 'active',
      index: true,
    },
    // User acknowledged expired product and chose to keep using with red warning
    isExpiredAcknowledged: {
      type: Boolean,
      default: false,
    },
    suitabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
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

// Virtual: check if product is expiring in 7 days or is already expired
collectionSchema.virtual('isExpiringSoon').get(function () {
  if (!this.expiryDate) return false;
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
});

collectionSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

collectionSchema.set('toJSON', { virtuals: true });
collectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Collection', collectionSchema);
