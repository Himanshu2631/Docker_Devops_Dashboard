require('dotenv').config();
const mongoose = require('mongoose');
const ContainerMetrics = require('./models/ContainerMetrics');
const connectDB = require('./config/db');

async function testAnalytics() {
  try {
    await connectDB();
    console.log('Connected to DB for analytics testing...');

    // 1. Check for most active container
    const active = await ContainerMetrics.aggregate([
      { $group: { _id: '$containerId', name: { $first: '$containerName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    if (!active.length) {
      console.log('No metrics found yet. Persistence might need more time.');
      process.exit(0);
    }

    const targetId = active[0]._id;
    console.log(`\nTesting analytics for container: ${active[0].name} (${targetId})`);

    // 2. Test Summary Aggregation
    console.log('\n--- Summary Analytics ---');
    const summary = await ContainerMetrics.aggregate([
      { $match: { containerId: targetId } },
      {
        $group: {
          _id: '$containerId',
          avgCpu: { $avg: '$cpuUsage' },
          peakMem: { $max: '$memoryUsage' },
          uptime: { $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);
    console.log(JSON.stringify(summary, null, 2));

    // 3. Test Trend Aggregation (Hourly)
    console.log('\n--- Global Trends (Hourly) ---');
    const trends = await ContainerMetrics.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00Z', date: '$timestamp' } },
          avgCpu: { $avg: '$cpuUsage' },
          activeServices: { $addToSet: '$containerId' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log(JSON.stringify(trends, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err.message);
    process.exit(1);
  }
}

testAnalytics();
