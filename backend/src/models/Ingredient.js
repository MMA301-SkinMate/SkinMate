const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'active',
    },
    benefits: {
      type: [String],
      default: [],
    },
    conflictsWith: {
      type: [String],
      default: [],
    },
    suitableSkinTypes: {
      type: [String],
      default: [],
    },
    unsuitableSkinTypes: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ingredient', ingredientSchema);

