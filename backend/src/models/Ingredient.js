const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên hoạt chất là bắt buộc'],
      unique: true,
      trim: true,
    },
    inciName: {
      type: String,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Chăm sóc da',
    },
    description: {
      type: String,
      default: '',
    },
    comedogenicRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    irritationRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // Do's for Skin types (e.g., ['Da_Dau', 'Da_Hon_Hop'])
    dosForSkinTypes: {
      type: [String],
      default: [],
    },
    // Don'ts for Skin types
    dontsForSkinTypes: {
      type: [String],
      default: [],
    },
    // Trị liệu cho Tình trạng da (e.g. ['Kích_Ứng', 'Nổi_Mụn'])
    treatmentForConditions: {
      type: [String],
      default: [],
    },
    // Cấm kỵ cho Tình trạng da
    bannedForConditions: {
      type: [String],
      default: [],
    },
    // Hoạt chất kỵ nhau (Conflict Matrix: AHA kỵ Retinol, BHA...)
    conflictsWith: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ingredient', ingredientSchema);
