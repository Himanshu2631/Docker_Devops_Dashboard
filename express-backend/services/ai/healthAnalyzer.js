const ContainerMetrics = require('../../models/ContainerMetrics');

/**
 * services/ai/healthAnalyzer.js
 * ----------------------------
 * Advanced analysis of infrastructure data to provide high-level health insights,
 * anomaly detection, and operational recommendations for the AI assistant.
 */

/**
 * Analyzes the current health and provides recommendations.
 * @param {Array} containers - List of container objects from Dockerode.
 * @param {Array} latestMetrics - List of latest metric snapshots.
 */
const analyzeInfrastructureHealth = (containers, latestMetrics) => {
  const total = containers.length;
  const running = containers.filter(c => c.State === 'running').length;
  
  // 1. Identify resource hotspots (Current)
  const hotspots = latestMetrics.filter(m => m.cpu > 80 || m.mem > 500);
  
  // 2. Identify unhealthy/stopped containers
  const stopped = containers.filter(c => c.State !== 'running');
  
  // 3. Recommendation Engine logic
  const recommendations = [];
  
  stopped.forEach(c => {
    const name = c.Names[0].replace('/', '');
    if (c.State === 'exited') {
      recommendations.push({
        target: name,
        action: 'RESTART',
        reason: 'Container exited unexpectedly',
        command: `docker start ${name}`
      });
    }
  });

  hotspots.forEach(h => {
    if (h.cpu > 80) {
      recommendations.push({
        target: h.name,
        action: 'OPTIMIZE',
        reason: 'CPU threshold exceeded (Critical Spike)',
        suggestion: 'Check application logs for infinite loops or high concurrency'
      });
    }
  });

  // 4. Calculate health score
  const runningScore = total > 0 ? (running / total) * 100 : 100;
  const hotspotPenalty = hotspots.length * 15;
  const healthScore = Math.max(0, Math.min(100, runningScore - hotspotPenalty));

  let status = 'HEALTHY';
  if (healthScore < 85) status = 'DEGRADED';
  if (healthScore < 60) status = 'CRITICAL';

  return {
    score: healthScore,
    status,
    summary: `${running}/${total} containers active. System status is ${status}.`,
    criticalIssues: hotspots.map(h => ({
      name: h.name,
      type: 'RESOURCE_PRESSURE',
      detail: h.cpu > 80 ? `CPU spike: ${h.cpu}%` : `Memory pressure: ${h.mem}MB`
    })),
    recommendations,
    stopped: stopped.map(c => c.Names[0].replace('/', ''))
  };
};

/**
 * Advanced Anomaly Detection
 * Checks if current load is significantly higher than historical averages.
 */
const detectAnomalies = async (latestMetrics) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get historical averages per container
    const historicalStats = await ContainerMetrics.aggregate([
      { $match: { timestamp: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: '$containerId',
          avgCpu: { $avg: '$cpuUsage' },
          name: { $first: '$containerName' }
        }
      }
    ]);

    const anomalies = [];
    latestMetrics.forEach(current => {
      const history = historicalStats.find(h => h._id === current.containerId || h.name === current.name);
      if (history && current.cpu > history.avgCpu * 2.5 && current.cpu > 20) {
        anomalies.push({
          container: current.name,
          metric: 'CPU',
          current: current.cpu,
          historicalAvg: history.avgCpu.toFixed(1),
          severity: 'HIGH'
        });
      }
    });

    return anomalies;
  } catch (err) {
    return [];
  }
};

/**
 * Summarizes recent metrics trends.
 */
const getTrendSummary = async () => {
  try {
    const range = new Date(Date.now() - 2 * 60 * 60 * 1000); // Last 2 hours
    const trends = await ContainerMetrics.aggregate([
      { $match: { timestamp: { $gte: range } } },
      {
        $group: {
          _id: null,
          avgCpu: { $avg: '$cpuUsage' },
          peakCpu: { $max: '$cpuUsage' },
          avgMem: { $avg: '$memoryUsage' },
          uptime: { $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    if (!trends.length) return "Limited telemetry data.";

    const t = trends[0];
    const uptimePct = ((t.uptime / t.total) * 100).toFixed(1);
    return `Analysis (2h): Avg CPU ${t.avgCpu?.toFixed(1)}%, Peak ${t.peakCpu?.toFixed(1)}%, Uptime ${uptimePct}%.`;
  } catch (err) {
    return "Telemetry analysis error.";
  }
};

module.exports = { analyzeInfrastructureHealth, getTrendSummary, detectAnomalies };
