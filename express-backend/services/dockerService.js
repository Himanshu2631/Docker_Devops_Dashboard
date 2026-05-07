const Docker = require('dockerode');

/**
 * Initialize Docker connection.
 * On Windows, it defaults to the named pipe: //./pipe/docker_engine
 * On Linux/macOS, it defaults to the unix socket: /var/run/docker.sock
 */
const docker = new Docker();

module.exports = docker;
