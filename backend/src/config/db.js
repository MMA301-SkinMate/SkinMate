const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skinmate';
    const conn = await mongoose.connect(mongoUri);
    console.log(`Database connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
