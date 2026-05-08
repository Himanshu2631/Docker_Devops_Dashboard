/**
 * DOCKER DASHBOARD BACKEND
 * Core Server Configuration
 */

// Load Environment Variables at the very beginning
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const socketManager = require('./socket/socketManager');

// Fallback / Default Environment Variables
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Initialize Socket.IO with environment-driven CORS
const io = socketManager.init(server);
if (!io) {
  console.warn('⚠️ Warning: Socket.IO failed to initialize. Real-time updates will be unavailable.');
}

// Route Files
const dockerRoutes = require('./routes/docker.routes');
const authRoutes = require('./routes/authRoutes');

// Mount Routes
app.use('/api/containers', dockerRoutes);
app.use('/api/auth', authRoutes);

// System Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    message: 'Cyberpunk Docker Backend Operational',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Start Server with DB readiness check
const startServer = async () => {
  try {
    // Initialize Database Connection
    await connectDB();

    server.listen(PORT, () => {
      console.log(`
  🚀 SYSTEM BOOT COMPLETE
  📡 PORT: ${PORT}
  🛠️  ENVIRONMENT: ${NODE_ENV}
  🌐 FRONTEND_URL: ${FRONTEND_URL}
  `);
    });
  } catch (err) {
    console.error(`❌ FATAL: Backend failed to boot: ${err.message}`);
    process.exit(1);
  }
};

startServer();
