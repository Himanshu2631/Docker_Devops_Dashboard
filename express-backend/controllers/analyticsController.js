const ContainerMetrics = require('../models/ContainerMetrics');

/**
 * controllers/analyticsController.js
 * ---------------------------------
 * Handles complex historical infrastructure analytics and trend analysis.
 */

/**
 * Helper to calculate start date from range string
 * @param {string} range - e.g., '1h', '24h', '7d'
 */
const getStartDateFromRange = (range) => {
  const now = new Date();
  switch (range) {
    case '1h': return new Date(now.getTime() - (60 * 60 * 1000));
    case '6h': return new Date(now.getTime() - (6 * 60 * 60 * 1000));
    case '24h': return new Date(now.getTime() - (24 * 60 * 60 * 1000));
    case '7d': return new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    case '30d': return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    default: return new Date(now.getTime() - (24 * 60 * 60 * 1000)); // Default 24h
  }
};

/**
 * GET /api/analytics/history/:containerId
 * Returns raw historical metrics for a specific container.
 */
exports.getContainerHistory = async (req, res) => {
  try {
    const { containerId } = req.params;
    const { range = '1h', limit = 100, status } = req.query;

    const startDate = getStartDateFromRange(range);
    const query = {
      containerId,
      timestamp: { $gte: startDate }
    };

    if (status) query.status = status.toLowerCase();

    const metrics = await ContainerMetrics.find(query)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      containerId,
      range,
      count: metrics.length,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/analytics/summary/:containerId
 * Returns aggregated summary (Avg CPU, Peak Mem, Uptime) for a container.
 */
exports.getContainerSummary = async (req, res) => {
  try {
    const { containerId } = req.params;
    const { range = '24h' } = req.query;
    const startDate = getStartDateFromRange(range);

    const stats = await ContainerMetrics.aggregate([
      { 
        $match: { 
          containerId, 
          timestamp: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: '$containerId',
          avgCpu: { $avg: '$cpuUsage' },
          peakCpu: { $max: '$cpuUsage' },
          avgMem: { $avg: '$memoryUsage' },
          peakMem: { $max: '$memoryUsage' },
          totalSnapshots: { $sum: 1 },
          runningSnapshots: {
            $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          containerId: '$_id',
          avgCpu: { $round: ['$avgCpu', 2] },
          peakCpu: { $round: ['$peakCpu', 2] },
          avgMem: { $round: ['$avgMem', 2] },
          peakMem: { $round: ['$peakMem', 2] },
          uptimePercentage: { 
            $round: [{ $multiply: [{ $divide: ['$runningSnapshots', '$totalSnapshots'] }, 100] }, 2] 
          },
          dataPoints: '$totalSnapshots'
        }
      }
    ]);

    if (!stats.length) {
      return res.status(404).json({ success: false, message: 'No data found for this range' });
    }

    res.json({
      success: true,
      range,
      summary: stats[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/analytics/trends
 * Returns global or container-specific trends over time.
 */
exports.getTrends = async (req, res) => {
  try {
    const { containerId, range = '24h', interval = '1h', status } = req.query;
    const startDate = getStartDateFromRange(range);

    const matchQuery = { timestamp: { $gte: startDate } };
    if (containerId) matchQuery.containerId = containerId;
    if (status) matchQuery.status = status.toLowerCase();

    // Determine grouping granularity
    let groupFormat = '%Y-%m-%dT%H:00:00Z'; // Hourly
    if (interval === '1m') groupFormat = '%Y-%m-%dT%H:%M:00Z';
    if (interval === '1d') groupFormat = '%Y-%m-%d';

    const trends = await ContainerMetrics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$timestamp' }
          },
          cpu: { $avg: '$cpuUsage' },
          memory: { $avg: '$memoryUsage' },
          activeContainers: { $addToSet: '$containerId' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          timestamp: '$_id',
          cpu: { $round: ['$cpu', 2] },
          memory: { $round: ['$memory', 2] },
          containerCount: { $size: '$activeContainers' }
        }
      }
    ]);

    res.json({
      success: true,
      range,
      interval,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
