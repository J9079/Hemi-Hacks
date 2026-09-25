const mongoose = require('mongoose');

const uri = 'mongodb+srv://yashparihar:iErrxSX8RDH8AR3k@cluster0.i2iv3xy.mongodb.net/surplus_to_shelter?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  console.log('Testing connection to MongoDB Atlas...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Successfully connected to user MongoDB Atlas Cluster!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database Name:', mongoose.connection.name);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();
