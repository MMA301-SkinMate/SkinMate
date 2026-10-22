const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên người dùng'],
      trim: true,
      maxlength: [50, 'Tên không được vượt quá 50 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Vui lòng cung cấp email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập đúng định dạng email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải từ 6 ký tự trở lên'],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    skinType: {
      type: String,
      enum: ['Da_Dau', 'Da_Kho', 'Da_Hon_Hop', 'Da_Nhay_Cam', 'Da_Thuong'],
      default: 'Da_Hon_Hop',
    },
    allergies: {
      type: [String],
      default: [],
    },
    currentConditions: {
      type: [String],
      default: ['Bình thường'],
    },
    streak: {
      type: Number,
      default: 1,
    },
    lastCheckinDate: {
      type: Date,
      default: Date.now,
    },
    notificationSettings: {
      isEnabled: { type: Boolean, default: true },
      morningTime: { type: String, default: '08:00' },
      eveningTime: { type: String, default: '20:00' },
      notifyExpiringProducts: { type: Boolean, default: true },
    },
    activeTreatmentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentPlan',
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
