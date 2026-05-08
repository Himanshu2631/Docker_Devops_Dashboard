/**
 * services/dockerEventService.js
 * ------------------------------
 * Listens to Docker daemon events and broadcasts them via Socket.IO.
 */

const docker = require('./dockerService');

/**
 * Starts the Docker event stream and maps events to Socket.IO broadcasts.
 * @param {Server} io - The Socket.IO server instance.
 */
const startStreamingEvents = async (io) => {
  try {
    const stream = await docker.getEvents();
    console.log('📡 [Docker Engine] Event stream established');

    stream.on('data', (chunk) => {
      if (!io) return;

      try {
        const event = JSON.parse(chunk.toString());
        
        // Filter for container lifecycle events
        if (event.Type === 'container') {
          const action = event.Action;
          
          // Map relevant actions
          const relevantActions = ['start', 'stop', 'restart', 'destroy', 'die', 'kill', 'pause', 'unpause'];
          
          if (relevantActions.includes(action)) {
            // Normalize action names
            let actionName = action;
            if (action === 'die' || action === 'kill') actionName = 'stop';
            
            const payload = {
              containerId: event.id,
              containerName: event.Actor.Attributes.name || 'unknown',
              action: actionName,
              status: actionName === 'stop' ? 'exited' : 'running',
              timestamp: new Date(event.time * 1000).toISOString(),
              rawAction: action // Keep raw action for debugging
            };

            console.log(`📦 Docker Event: ${payload.action} | Container: ${payload.containerName}`);
            io.emit('docker:event', payload);
          }
        }
      } catch (err) {
        // Handle parsing errors for individual chunks
      }
    });

    stream.on('error', (err) => {
      console.error('❌ Docker Stream Error:', err.message);
      // Reconnection logic: wait 5s and retry
      setTimeout(() => startStreamingEvents(io), 5000);
    });

    stream.on('end', () => {
      console.warn('⚠️ Docker Stream Ended. Reconnecting...');
      setTimeout(() => startStreamingEvents(io), 5000);
    });

  } catch (err) {
    console.error('❌ Failed to establish Docker event stream:', err.message);
    // Reconnection logic: retry after 5s
    setTimeout(() => startStreamingEvents(io), 5000);
  }
};

module.exports = { startStreamingEvents };
