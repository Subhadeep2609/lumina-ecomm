import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luminamarket';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB Atlas] Connected to Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to database: ${error.message}`);
    console.warn(`[MongoDB Warning] Server will operate in resilient mode for endpoints.`);
    return false;
  }
};

export default connectDB;
