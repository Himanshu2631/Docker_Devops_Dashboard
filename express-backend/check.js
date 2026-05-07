try {
  require('dotenv');
  console.log('✅ Dotenv is accessible');
} catch (e) {
  console.log('❌ Dotenv NOT found:', e.message);
}
