const docker = require('../services/dockerService');
const Activity = require('../models/Activity');

// Helper to log activity
const logActivity = async (req, action, id, containerName = 'Unknown') => {
  try {
    await Activity.create({
      user: req.user ? req.user._id : null,
      action,
      containerId: id,
      containerName: containerName,
      status: 'success'
    });
  } catch (err) {
    console.error('Activity Logging Failed:', err.message);
  }
};

/**
 * Test the Docker connection
 */
const testConnection = async (req, res) => {
  try {
    const result = await docker.ping();
    if (result.toString() === 'OK') {
      return res.status(200).json({ success: true, message: 'Docker connected' });
    } else {
      throw new Error('Ping failed');
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to connect to Docker', error: error.message });
  }
};

/**
 * Fetch all containers
 */
const listContainers = async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    
    const total = containers.length;
    const running = containers.filter(c => c.State === 'running' || c.Status.toLowerCase().includes('up')).length;
    const exited = containers.filter(c => c.State === 'exited' || c.Status.toLowerCase().includes('exited')).length;

    const formattedContainers = containers.map(container => ({
      Id: container.Id,
      Names: container.Names,
      Image: container.Image,
      State: container.State,
      Status: container.Status,
      state: container.State,
      name: container.Names[0]?.replace('/', '') || 'unnamed'
    }));

    return res.status(200).json({
      success: true,
      total,
      running,
      exited,
      data: formattedContainers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch containers', error: error.message });
  }
};

/**
 * Start a container
 */
const startContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    const data = await container.inspect();
    await container.start();
    
    await logActivity(req, 'start', id, data.Name.replace('/', ''));
    
    return res.status(200).json({ success: true, message: `Container ${id} started successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to start container', error: error.message });
  }
};

/**
 * Stop a container
 */
const stopContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    const data = await container.inspect();
    await container.stop();
    
    await logActivity(req, 'stop', id, data.Name.replace('/', ''));

    return res.status(200).json({ success: true, message: `Container ${id} stopped successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to stop container', error: error.message });
  }
};

/**
 * Restart a container
 */
const restartContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    const data = await container.inspect();
    await container.restart();
    
    await logActivity(req, 'restart', id, data.Name.replace('/', ''));

    return res.status(200).json({ success: true, message: `Container ${id} restarted successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to restart container', error: error.message });
  }
};

/**
 * Fetch logs
 */
const getContainerLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    const logs = await container.logs({ stdout: true, stderr: true, tail: 100, timestamps: true });
    return res.status(200).json({ success: true, logs: logs.toString('utf-8') });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch container logs', error: error.message });
  }
};

/**
 * Fetch stats
 */
const getContainerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    const stats = await container.stats({ stream: false });
    return res.status(200).json({
      success: true,
      stats: {
        cpu_usage: stats.cpu_stats.cpu_usage.total_usage,
        memory_usage: stats.memory_stats.usage,
        memory_limit: stats.memory_stats.limit,
        timestamp: stats.read
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch container stats', error: error.message });
  }
};

/**
 * Remove a container
 */
const removeContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    const data = await container.inspect();
    await container.remove({ force: true });
    
    await logActivity(req, 'remove', id, data.Name.replace('/', ''));

    return res.status(200).json({ success: true, message: `Container ${id} removed successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove container', error: error.message });
  }
};

/**
 * Fetch system info
 */
const getSystemInfo = async (req, res) => {
  try {
    const info = await docker.info();
    return res.status(200).json({
      success: true,
      data: {
        Containers: info.Containers,
        ContainersRunning: info.ContainersRunning,
        ContainersPaused: info.ContainersPaused,
        ContainersStopped: info.ContainersStopped,
        Images: info.Images,
        Driver: info.Driver,
        SystemTime: info.SystemTime,
        NCPU: info.NCPU,
        MemTotal: info.MemTotal,
        OperatingSystem: info.OperatingSystem,
        ServerVersion: info.ServerVersion
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch system info', error: error.message });
  }
};

module.exports = {
  testConnection,
  listContainers,
  startContainer,
  stopContainer,
  restartContainer,
  removeContainer,
  getContainerLogs,
  getContainerStats,
  getSystemInfo
};
