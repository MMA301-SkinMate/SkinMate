const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết là bắt buộc'],
      trim: true,
      maxlength: [120, 'Tiêu đề không được vượt quá 120 ký tự'],
    },
    content: {
      type: String,
      default: '',
    },
    skinType: {
      type: String,
      default: 'Da_Hon_Hop',
    },
    tags: {
      type: [String],
      default: [],
    },
    routineData: {
      title: String,
      totalDays: Number,
      schedule: Array,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    copiesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          default: 'Thông tin không phù hợp',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reportsCount: {
      type: Number,
      default: 0,
    },
    // Auto-hide when reportsCount >= 5
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to report post
communityPostSchema.methods.addReport = function (userId, reason) {
  const alreadyReported = this.reports.some(
    (r) => r.user && r.user.toString() === userId.toString()
  );
  if (!alreadyReported) {
    this.reports.push({ user: userId, reason });
    this.reportsCount = this.reports.length;
    if (this.reportsCount >= 5) {
      this.isHidden = true;
    }
  }
};

module.exports = mongoose.model('CommunityPost', communityPostSchema);
