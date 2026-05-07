const express = require('express');
const router = express.Router();
const { 
  testConnection, 
  listContainers, 
  startContainer, 
  stopContainer, 
  restartContainer, 
  removeContainer,
  getContainerLogs,
  getContainerStats,
  getSystemInfo
} = require('../controllers/docker.controller');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/containers/test
 * @desc    Test Docker connection
 * @access  Public
 */
router.get('/test', testConnection);

/**
 * @route   GET /api/containers
 * @desc    List all containers
 * @access  Public
 */
router.get('/', listContainers);

/**
 * @route   GET /api/containers/system
 * @desc    Get system info
 * @access  Public
 */
router.get('/system', getSystemInfo);

/**
 * @route   POST /api/containers/:id/start
 * @desc    Start a container
 * @access  Protected (Auth handled via optional user logging)
 */
router.post('/:id/start', startContainer);

/**
 * @route   POST /api/containers/:id/stop
 * @desc    Stop a container
 * @access  Protected
 */
router.post('/:id/stop', stopContainer);

/**
 * @route   POST /api/containers/:id/restart
 * @desc    Restart a container
 * @access  Protected
 */
router.post('/:id/restart', restartContainer);

/**
 * @route   DELETE /api/containers/:id
 * @desc    Remove a container
 * @access  Protected
 */
router.delete('/:id', removeContainer);

/**
 * @route   GET /api/containers/:id/logs
 * @desc    Get container logs
 * @access  Public
 */
router.get('/:id/logs', getContainerLogs);

/**
 * @route   GET /api/containers/:id/stats
 * @desc    Get container stats
 * @access  Public
 */
router.get('/:id/stats', getContainerStats);

module.exports = router;
