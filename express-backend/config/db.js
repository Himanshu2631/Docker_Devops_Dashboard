const mongoose = require('mongoose');

/**
 * DATABASE CONNECTION MANAGER
 * Designed to be resilient.
 */

// Connection state listeners
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Event: Connected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Event: Error - ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Event: Disconnected');
});

const connectDB = async () => {
  try {
    // Force reload from .env in case of caching issues
    require('dotenv').config();

    const { DB_USER, DB_PASS, DB_HOST, DB_NAME } = process.env;

    if (!DB_USER || !DB_PASS || !DB_HOST) {
      console.warn('⚠️ Missing Database Credentials in .env. Checking for MONGO_URI...');
      if (!process.env.MONGO_URI) {
        console.error('❌ No DB credentials found.');
        return;
      }
    }

    // Construct the SRV URI from components (Prioritize these to avoid stale MONGO_URI)
    const encodedPass = encodeURIComponent(DB_PASS);
    const finalUri = process.env.MONGO_URI || `mongodb+srv://${DB_USER}:${encodedPass}@${DB_HOST}/${DB_NAME || 'DockerTUI'}?retryWrites=true&w=majority`;

    // Masked log for security
    const maskedLog = finalUri.includes('@')
      ? `mongodb+srv://${DB_USER}:****@${DB_HOST || 'unknown'}`
      : 'mongodb://localhost:27017/...';

    console.log(`🔌 Attempting DB connection: ${maskedLog}`);

    await mongoose.connect(finalUri, {
      serverSelectionTimeoutMS: 15000
    });

    console.log(`🚀 MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    if (error.message.includes('IP address')) {
      console.error('👉 TIP: Ensure your current IP is whitelisted in MongoDB Atlas.');
    }
    console.warn('🛠️ The server is still running, but Login/Signup features will fail until DB connects.');
  }
};

module.exports = connectDB;
