const Docker = require('dockerode');
let docker;

try {
    docker = new Docker();
    console.log('🐳 Docker service initialized (checking for engine...)');
} catch (err) {
    console.warn('⚠️ Docker Engine not found. Operating in Demo/Limited mode.');
    docker = null; // We will use this 'null' to send demo data later
}

module.exports = docker;
