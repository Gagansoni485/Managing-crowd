const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const queueRoutes = require('./routes/queueRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const templeRoutes = require('./routes/templeRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const guardRoutes = require('./routes/guardRoutes');

// Import socket handlers
const { initializeQueueSocket } = require('./socket/queueSocket');
const { initializeEmergencySocket } = require('./socket/emergencySocket');
const { initializeCrowdSocket } = require('./socket/crowdSocket');
const { expirePastBookings } = require('./services/queueService');

// Initialize sockets
initializeQueueSocket(io);
initializeEmergencySocket(io);
initializeCrowdSocket(io);

// Auto-expire past bookings every 5 minutes
setInterval(async () => {
  try {
    const expiredCount = await expirePastBookings();
    if (expiredCount > 0) {
      console.log(`Auto-expired ${expiredCount} past bookings`);
    }
  } catch (error) {
    console.error('Error in booking expiry check:', error);
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Run initial expiry check on startup
expirePastBookings().then(count => {
  if (count > 0) {
    console.log(`Initial expiry: ${count} past bookings expired`);
  }
}).catch(err => console.error('Initial expiry check failed:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/visitor', visitorRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/temples', templeRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/guard', guardRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = { app, server, io };
