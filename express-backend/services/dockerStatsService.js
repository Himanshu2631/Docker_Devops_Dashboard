/**
 * services/dockerStatsService.js
 * -------------------------------
 * Periodically fetches global Docker stats and broadcasts via Socket.IO.
 */

const docker = require('./dockerService');

let statsInterval;

/**
 * Starts periodic stats broadcasting.
 * @param {Server} io - The Socket.IO server instance.
 */
const startStatsBroadcast = (io) => {
  if (statsInterval) clearInterval(statsInterval);

  console.log('📊 [Docker Engine] Stats broadcasting service started');

  statsInterval = setInterval(async () => {
    if (!io) return;

    try {
      const containers = await docker.listContainers({ all: true });
      
      const stats = {
        total: containers.length,
        running: containers.filter(c => c.State === 'running').length,
        exited: containers.filter(c => c.State === 'exited' || c.Status.includes('Exited')).length,
        timestamp: new Date().toISOString()
      };

      // Also generate mock system telemetry for charts
      const telemetry = {
        cpu: Math.floor(Math.random() * 25) + 5, // Simulated load
        memory: Math.floor(Math.random() * 15) + 40,
        network: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      };

      io.emit('docker:stats', { stats, telemetry });
    } catch (err) {
      console.error('❌ Failed to fetch Docker stats for broadcast:', err.message);
    }
  }, 5000); // Broadcast every 5 seconds
};

module.exports = { startStatsBroadcast };
