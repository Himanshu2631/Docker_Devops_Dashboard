/**
 * controllers/health.controller.js
 * ---------------------------------
 * Handles the business logic for the root/health endpoint.
 * Keeps route files thin by separating concerns.
 */

/**
 * GET /
 * Responds with a simple JSON message confirming the server is running.
 *
 * @param {import('express').Request}  req  - Express request object
 * @param {import('express').Response} res  - Express response object
 */
const getStatus = (req, res) => {
  res.status(200).json({
    message: 'Server running',
  });
};

module.exports = { getStatus };
