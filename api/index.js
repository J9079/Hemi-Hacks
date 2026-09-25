const { app } = require('../server/server');
const { connectDB } = require('../server/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Vercel Serverless Function Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Serverless invocation error: ' + (err.message || 'Internal Server Error')
    });
  }
};
