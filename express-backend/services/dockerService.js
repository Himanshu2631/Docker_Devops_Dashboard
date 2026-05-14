const Docker = require('dockerode');
let docker;

try {
    docker = new Docker();
    // Test the connection immediately
    docker.ping();
    console.log('🐳 Docker Engine connected successfully');
} catch (err) {
    console.warn('⚠️ Docker Engine not found. Operating in Demo/Limited mode.');
    docker = null; // We will use this 'null' to send demo data later
}

module.exports = docker;
