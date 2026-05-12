const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

/**
 * routes/analyticsRoutes.js
 * -------------------------
 * API endpoints for historical infrastructure data and trend analysis.
 */

// Get raw history for a specific container
router.get('/history/:containerId', analyticsController.getContainerHistory);

// Get performance summary (averages, peaks, uptime %) for a specific container
router.get('/summary/:containerId', analyticsController.getContainerSummary);

// Get infrastructure-wide or container-specific trends over time
router.get('/trends', analyticsController.getTrends);

module.exports = router;
