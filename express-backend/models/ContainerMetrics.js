const mongoose = require('mongoose');

/**
 * ContainerMetrics Schema
 * Stores historical infrastructure metrics for observability analytics and trend analysis.
 */
const containerMetricsSchema = new mongoose.Schema({
  containerId: {
    type: String,
    required: [true, 'Container ID is required'],
    index: true, // Indexed for fast lookups by specific container
    trim: true
  },
  containerName: {
    type: String,
    required: [true, 'Container name is required'],
    trim: true
  },
  cpuUsage: {
    type: Number,
    required: [true, 'CPU usage metric is required'],
    min: [0, 'CPU usage cannot be negative'],
    default: 0
  },
  memoryUsage: {
    type: Number,
    required: [true, 'Memory usage metric is required'],
    min: [0, 'Memory usage cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    required: [true, 'Container status is required'],
    lowercase: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Indexed for time-series trend queries
  }
}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true,
  // Ensure virtuals are included when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient historical queries per container
containerMetricsSchema.index({ containerId: 1, timestamp: -1 });

// Optimize for time-range queries (e.g., "all metrics from the last 24 hours")
containerMetricsSchema.index({ timestamp: 1 });

/**
 * @model ContainerMetrics
 */
const ContainerMetrics = mongoose.model('ContainerMetrics', containerMetricsSchema);

module.exports = ContainerMetrics;
