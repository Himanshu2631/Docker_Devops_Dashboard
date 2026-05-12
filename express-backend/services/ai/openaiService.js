const OpenAI = require('openai');
const { getInfrastructureContext } = require('./contextBuilder');

/**
 * services/ai/openaiService.js
 * ----------------------------
 * Manages communication with OpenAI API and handles prompt engineering
 * with infrastructure context.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an AI response based on user input and system context.
 * @param {string} userMessage - The user's query.
 * @param {Array} chatHistory - Previous messages in the conversation.
 */
const getChatResponse = async (userMessage, chatHistory = []) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API Key is missing. Please configure it in your .env file.');
    }

    // Gather real-time infrastructure context
    const context = await getInfrastructureContext();

    const systemPrompt = `
      You are "Core-AI", a specialized DevOps & Observability Assistant integrated into the DockerOS dashboard.
      Your mission is to provide high-fidelity infrastructure analysis, diagnostic reasoning, and proactive operational recommendations.

      OPERATIONAL CONTEXT (Live Observability Data):
      ${JSON.stringify(context, null, 2)}

      OPERATIONAL GUIDELINES:
      1. DIAGNOSTIC ANALYSIS: Start with the "health" summary. If the score is < 90, explain the root causes using "health.issues" and "anomalies".
      2. RECOMMENDATION ENGINE: Actively suggest actions from "health.recommendations". If a container is stopped, explain WHY it should be restarted.
      3. TELEMETRY SIMPLIFICATION: Translate raw metrics (CPU %, Mem MB) into plain English (e.g., "The backend service is under heavy load, likely due to a recent spike in traffic").
      4. ANOMALY DETECTION: If "anomalies" are present, emphasize that current behavior deviates from the 24h historical baseline.
      5. EVENT CORRELATION: Correlate "events" (restarts, stops) with "health" trends to explain service instability.
      6. ACTIONABLE DOCKER CLI: Provide specific commands for remediation (e.g., 'docker restart <name>', 'docker logs --tail 100 <name>').
      7. DATA FIDELITY: Only speak to the data provided. If you identify "resource pressure", suggest optimization.

      TONE: Professional, proactive, and data-driven. You are a Senior Site Reliability Engineer (SRE).
    `;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using the latest efficient model
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      message: response.choices[0].message.content,
      usage: response.usage,
      contextUsed: {
        containerCount: context.containers?.length || 0,
        eventCount: context.recentEvents?.length || 0
      }
    };
  } catch (error) {
    console.error('❌ OpenAI Service Error:', error.message);
    throw error;
  }
};

module.exports = { getChatResponse };
