const mongoose = require('mongoose');
require('dotenv').config();

const { DB_USER, DB_PASS, DB_HOST, DB_NAME } = process.env;
const encodedPass = encodeURIComponent(DB_PASS);
const uri = `mongodb+srv://${DB_USER}:${encodedPass}@${DB_HOST}/${DB_NAME || 'DockerTUI'}?retryWrites=true&w=majority`;

console.log('Testing connection to:', `mongodb+srv://${DB_USER}:****@${DB_HOST}/${DB_NAME}`);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
