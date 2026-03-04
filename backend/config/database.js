const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    if (process.env.NODE_ENV === 'production') {
      // Log the error to a monitoring service
      console.error('Database connection failed');
    } else {
      process.exit(1); // Exit in development for immediate visibility
    }
  }
};

module.exports = connectDB;