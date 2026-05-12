const docker = require('./dockerService');
const ContainerMetrics = require('../models/ContainerMetrics');

/**
 * services/metricsPersistenceService.js
 * -------------------------------------
 * Periodically captures real container metrics from Docker Engine
 * and persists them to MongoDB for historical analysis.
 */

let persistenceInterval;

/**
 * Calculates CPU usage percentage from Docker stats.
 * Formula: (cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage) / 
 *          (cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage) * number_of_cpus * 100.0
 */
const calculateCpuUsage = (stats) => {
  try {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage.length || 1;

    if (systemDelta > 0 && cpuDelta > 0) {
      return (cpuDelta / systemDelta) * cpuCount * 100.0;
    }
    return 0;
  } catch (e) {
    return 0;
  }
};

/**
 * Calculates Memory usage in MB.
 */
const calculateMemoryUsage = (stats) => {
  try {
    const usedMemory = stats.memory_stats.usage || 0;
    return usedMemory / (1024 * 1024); // Convert to MB
  } catch (e) {
    return 0;
  }
};

/**
 * Captures and persists metrics for all running containers.
 */
const captureMetrics = async () => {
  try {
    // Only capture metrics for running (active) containers to keep collection lightweight
    const containers = await docker.listContainers({ 
      filters: { status: ['running'] } 
    });
    
    const metricsPromises = containers.map(async (containerInfo) => {
      try {
        const container = docker.getContainer(containerInfo.Id);
        
        // Get non-streaming stats (snapshot)
        const stats = await container.stats({ stream: false });
        
        const cpuUsage = calculateCpuUsage(stats);
        const memoryUsage = calculateMemoryUsage(stats);
        
        // Create and save metric entry
        const metric = new ContainerMetrics({
          containerId: containerInfo.Id,
          containerName: containerInfo.Names[0]?.replace('/', '') || 'unknown',
          cpuUsage: cpuUsage.toFixed(2),
          memoryUsage: memoryUsage.toFixed(2),
          status: containerInfo.State,
          timestamp: new Date()
        });

        return metric.save();
      } catch (err) {
        // Skip containers that fail to provide stats (e.g., stopped ones)
        console.warn(`⚠️  Failed to capture metrics for container ${containerInfo.Id.substring(0, 8)}: ${err.message}`);
        return null;
      }
    });

    await Promise.all(metricsPromises);
    if (containers.length > 0) {
      console.log(`📉 [Persistence] Snapshot stored: ${containers.length} active containers.`);
    }
  } catch (error) {
    console.error('❌ Metrics Persistence Error:', error.message);
  }
};

/**
 * Starts the persistence service.
 * @param {number} intervalMs - How often to save metrics (default 60s).
 */
const startMetricsPersistence = () => {
  if (persistenceInterval) {
    console.log('♻️ [Persistence] Restarting existing metrics collector...');
    clearInterval(persistenceInterval);
  }
  
  const intervalMs = parseInt(process.env.METRICS_COLLECTION_INTERVAL) || 60000;
  console.log(`🏛️ [Persistence] Initializing telemetry collection (Interval: ${intervalMs}ms)`);
  
  // Prevent immediate burst on startup
  setTimeout(captureMetrics, 5000);
  
  // Set interval for periodic capture
  persistenceInterval = setInterval(captureMetrics, intervalMs);
};

module.exports = { startMetricsPersistence };
