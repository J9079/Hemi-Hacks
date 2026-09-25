const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  // If already connected (e.g. serverless warm container), reuse existing connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/surplus_to_shelter';
  
  try {
    // Attempt connection with 8-second timeout suitable for cloud Atlas and local MongoDB
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`[Database] MongoDB connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[Database] Failed to connect to configured MongoDB (${err.message}). Initializing embedded MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to embedded in-memory MongoDB at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Fatal: Failed to initialize in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
