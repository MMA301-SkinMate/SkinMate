const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    productName: {
      type: String,
      default: 'Sản phẩm mới quét',
    },
    brand: {
      type: String,
      default: 'Chưa rõ',
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
    analysisResult: {
      score: { type: Number, default: 70 },
      baseScore: { type: Number, default: 70 },
      verdict: { type: String, default: '' },
      pros: { type: [String], default: [] },
      cons: { type: [String], default: [] },
      conflictResolution: { type: String, default: '' },
      bestPairingInCloset: { type: String, default: '' },
      futurePlan: { type: String, default: '' },
      aiExplanation: { type: String, default: '' },
    },
    isAddedToCollection: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
