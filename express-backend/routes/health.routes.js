/**
 * routes/health.routes.js
 * -----------------------
 * Defines all routes related to the root/health endpoint.
 * Each route delegates its business logic to the corresponding controller.
 */

const express = require('express');
const router = express.Router();

// Import the health controller
const healthController = require('../controllers/health.controller');

// ──────────────────────────────────────────────
// Route Definitions
// ──────────────────────────────────────────────

/**
 * GET /
 * Returns a simple status message confirming the server is running.
 */
router.get('/', healthController.getStatus);

module.exports = router;
