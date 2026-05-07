/**
 * socket/socketManager.js
 * -----------------------
 * Manages Socket.IO connections and real-time Docker events.
 */

const { Server } = require('socket.io');
const docker = require('../services/dockerService');

let io;

/**
 * Initialize Socket.IO with an HTTP server.
 * @param {http.Server} server - The HTTP server instance.
 */
const init = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);

      // Emit test event on connection
      socket.emit('server:connected', {
        message: 'Successfully connected to Docker Real-Time Monitor',
        timestamp: new Date().toISOString()
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    // Start listening to Docker events
    startDockerEventListener();

    return io;
  } catch (error) {
    console.error('❌ Socket initialization failed:', error.message);
    // Return a dummy object to prevent crash if server.js expects an object
    return null;
  }
};

/**
 * Listen for events from the Docker daemon and broadcast via Socket.IO.
 */
const startDockerEventListener = async () => {
  try {
    const stream = await docker.getEvents();
    console.log('📡 Listening for Docker system events...');

    stream.on('data', (chunk) => {
      if (!io) return;

      try {
        const event = JSON.parse(chunk.toString());
        
        // We are interested in container events: start, stop, die, restart
        if (event.Type === 'container') {
          const action = event.Action;
          
          if (['start', 'stop', 'restart', 'die', 'kill'].includes(action)) {
            const payload = {
              containerId: event.id,
              containerName: event.Actor.Attributes.name || 'unknown',
              actionType: action === 'die' || action === 'kill' ? 'stop' : action,
              timestamp: new Date(event.time * 1000).toISOString()
            };

            console.log(`📦 Docker Event: ${payload.actionType} on ${payload.containerName}`);
            io.emit('docker:event', payload);
          }
        }
      } catch (err) {
        console.error('❌ Error parsing Docker event chunk:', err.message);
      }
    });

    stream.on('error', (err) => {
      console.error('❌ Docker event stream error:', err.message);
      // Attempt to restart listener after a delay
      setTimeout(startDockerEventListener, 5000);
    });

  } catch (err) {
    console.error('❌ Failed to start Docker event listener:', err.message);
    // Attempt to restart listener after a delay
    setTimeout(startDockerEventListener, 5000);
  }
};

/**
 * Get the IO instance.
 */
const getIO = () => {
  if (!io) {
    console.warn('⚠️ Warning: Attempted to get IO before initialization');
  }
  return io;
};

module.exports = {
  init,
  getIO
};
