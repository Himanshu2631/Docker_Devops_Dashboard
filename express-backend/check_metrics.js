require('dotenv').config();
const mongoose = require('mongoose');
const ContainerMetrics = require('./models/ContainerMetrics');
const connectDB = require('./config/db');

async function checkMetrics() {
  try {
    await connectDB();
    const count = await ContainerMetrics.countDocuments();
    console.log(`\n📊 Total Metric Records: ${count}`);
    
    if (count > 0) {
      const latest = await ContainerMetrics.find().sort({ timestamp: -1 }).limit(3);
      console.log('\n🕒 Latest Metrics Captured:');
      latest.forEach(m => {
        console.log(`- [${m.timestamp.toISOString()}] ${m.containerName}: CPU ${m.cpuUsage}%, MEM ${m.memoryUsage}MB (${m.status})`);
      });
    } else {
      console.log('\n⌛ No metrics captured yet. Waiting for the first persistence cycle...');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkMetrics();
