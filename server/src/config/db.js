const mongoose = require('mongoose');

let cached = global._mongooseConnection;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set. Aborting DB connection.');
  }

  // Reuse existing connection in serverless environments
  if (cached && cached.readyState === 1) {
    return cached;
  }

  if (mongoose.connection.readyState === 1) {
    global._mongooseConnection = mongoose.connection;
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global._mongooseConnection = conn.connection;
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error; // Re-throw so the caller (serverless handler) can handle it
  }
};

module.exports = connectDB;
