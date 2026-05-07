const axios = require('axios');

async function test() {
  try {
    const response = await axios.get('http://localhost:5000/containers');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
