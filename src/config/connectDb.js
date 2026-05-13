const mongoose = require('mongoose');

const connectDb = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Starting with mock in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDb;
