const { getChatResponse } = require('../services/ai/openaiService');

/**
 * controllers/aiController.js
 * ---------------------------
 * Handles AI-related API requests and response formatting.
 */

/**
 * POST /api/ai/chat
 * Main chat endpoint for the DevOps assistant.
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Process chat with AI service
    const response = await getChatResponse(message, history);

    res.json({
      success: true,
      data: {
        reply: response.message,
        metadata: response.contextUsed,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ AI Controller Error:', error.message);
    
    // Check for specific OpenAI errors
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'The AI assistant encountered an error processing your request.';

    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};
