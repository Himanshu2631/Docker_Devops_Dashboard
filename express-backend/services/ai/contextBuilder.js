const docker = require('../dockerService');
const ContainerMetrics = require('../../models/ContainerMetrics');
const Activity = require('../../models/Activity');
const { analyzeInfrastructureHealth, getTrendSummary, detectAnomalies } = require('./healthAnalyzer');

/**
 * services/ai/contextBuilder.js
 * ----------------------------
 * Aggregates real-time and historical infrastructure data
 * to build a contextual prompt for the AI assistant.
 */

/**
 * Gathers comprehensive infrastructure context.
 * @returns {Promise<Object>} The collected context.
 */
const getInfrastructureContext = async () => {
  try {
    const containers = await docker.listContainers({ all: true });
    
    // Optimized Container Summary (reduces token count)
    const containerContext = containers.map(c => ({
      n: c.Names[0].replace('/', ''),
      s: c.State,
      i: c.Image.split(':')[0], // Only image name, no tags/hashes
      p: c.Ports?.[0]?.PublicPort || 'int'
    }));

    const latestMetrics = await ContainerMetrics.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$containerId',
          name: { $first: '$containerName' },
          cpu: { $first: '$cpuUsage' },
          mem: { $first: '$memoryUsage' }
        }
      }
    ]);

    const health = analyzeInfrastructureHealth(containers, latestMetrics);
    const trends = await getTrendSummary();
    const anomalies = await detectAnomalies(latestMetrics);

    const recentActivities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select('action containerName timestamp');

    return {
      ts: new Date().toISOString(),
      health: {
        score: health.score,
        status: health.status,
        issues: health.criticalIssues,
        stopped: health.stopped,
        recommendations: health.recommendations
      },
      anomalies: anomalies,
      stats: trends,
      inventory: containerContext,
      events: recentActivities.map(a => `${a.timestamp.toLocaleTimeString()}: ${a.containerName} ${a.action}`)
    };
  } catch (error) {
    console.error('❌ Error building AI context:', error.message);
    return { error: 'Context capture failed' };
  }
};

module.exports = { getInfrastructureContext };
