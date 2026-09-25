require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach socket.io to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Surplus-to-Shelter Backend API',
    timestamp: new Date().toISOString(),
    city: 'Ajmer, Rajasthan'
  });
});

// Routes will be registered here as each module is implemented
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/matching', require('./routes/matchingRoutes'));
app.use('/api/ngos', require('./routes/ngoRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error('[API Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.IO Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`[Socket] ${socket.id} joined room: ${room}`);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`[Socket] ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
const { seedDatabase } = require('./seeds/seedData');
const User = require('./models/User');

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is empty for zero-friction hackathon demo
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] Database is empty. Running automatic seed...');
      await seedDatabase();
    }
  } catch (seedErr) {
    console.warn('[Bootstrap] Auto-seed check error:', seedErr.message);
  }

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Surplus-to-Shelter Engine active on http://localhost:${PORT}`);
    console.log(` Socket.IO real-time channel initialized`);
    console.log(`=======================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
