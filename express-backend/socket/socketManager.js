/**
 * socket/socketManager.js
 * -----------------------
 * Core Socket.IO Manager for real-time Docker events and stats.
 */

const { Server } = require('socket.io');
const { startStreamingEvents } = require('../services/dockerEventService');
const { startStatsBroadcast } = require('../services/dockerStatsService');

let io;

/**
 * Initializes the Socket.IO server instance.
 */
const init = (httpServer) => {
  try {
    io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    console.log('🌐 Socket.IO Server Initialized');

    io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      socket.emit('server:connected', {
        status: 'online',
        message: 'Real-time Docker Monitor Engine Active',
        timestamp: new Date().toISOString()
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    // Start Real-time Services
    startStreamingEvents(io);
    startStatsBroadcast(io);

    return io;
  } catch (error) {
    console.error('❌ Socket initialization error:', error.message);
    return null;
  }
};

const getIO = () => {
  if (!io) {
    console.warn('⚠️ Attempted to get IO before initialization');
  }
  return io;
};

module.exports = {
  init,
  getIO
};
