const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const rateLimit = require('express-rate-limit');

/**
 * routes/aiRoutes.js
 * ------------------
 * API endpoints for the AI-powered DevOps Assistant.
 */

// Rate limiting for AI endpoints to prevent API abuse/cost spikes
const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

/**
 * @route POST /api/ai/chat
 * @desc  Send a message to the AI DevOps Assistant
 * @access Public (Consider adding auth middleware if needed)
 */
router.post('/chat', aiChatLimiter, aiController.handleChat);

module.exports = router;
