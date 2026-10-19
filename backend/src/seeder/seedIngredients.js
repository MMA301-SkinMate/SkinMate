const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ingredient = require('../models/Ingredient');
const ingredientData = require('./ingredientData.json');

dotenv.config({ path: '../../.env' });
if (!process.env.MONGO_URI) {
  dotenv.config();
}

const seed = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skinmate';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri}`);

    await Ingredient.deleteMany({});
    console.log('Cleared existing ingredients collection.');

    const created = await Ingredient.insertMany(ingredientData);
    console.log(`Successfully seeded ${created.length} ingredients.`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
