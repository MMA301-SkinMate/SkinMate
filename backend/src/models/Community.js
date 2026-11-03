const mongoose = require('mongoose');
const { productTypes, productIcons } = require('./Collection');

const skinTypes = ['Da dầu', 'Da khô', 'Da hỗn hợp thiên dầu', 'Da hỗn hợp thiên khô', 'Da nhạy cảm', 'Da thường'];

const routineStepSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true, maxlength: 150 },
    productType: { type: String, enum: productTypes, required: true },
    productIcon: { type: String, enum: productIcons, default: null },
    note: { type: String, default: null, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const communitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    authorName: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    images: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    skinType: {
      type: String,
      enum: skinTypes,
      default: null,
    },

    skinTypes: {
      type: [{ type: String, enum: skinTypes }],
      default: undefined,
    },

    sharedRoutine: {
      morning: { type: [routineStepSchema], default: [] },
      evening: { type: [routineStepSchema], default: [] },
      days: {
        type: [
          {
            dayNumber: { type: Number, min: 1, max: 31 },
            morning: { type: [routineStepSchema], default: [] },
            evening: { type: [routineStepSchema], default: [] },
          },
        ],
        default: undefined,
      },
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    likedUserIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    copiesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'hidden', 'deleted'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

communitySchema.index({ status: 1, skinType: 1, createdAt: -1 });
communitySchema.index({ status: 1, skinTypes: 1, createdAt: -1 });

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
module.exports.skinTypes = skinTypes;
