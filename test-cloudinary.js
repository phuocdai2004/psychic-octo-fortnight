// Test Cloudinary Configuration
require('dotenv').config();

console.log('\n=== CLOUDINARY CONFIGURATION CHECK ===\n');

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET);
console.log('API Secret Length:', process.env.CLOUDINARY_API_SECRET?.length);
console.log('API Secret (hex):', Buffer.from(process.env.CLOUDINARY_API_SECRET || '').toString('hex'));

console.log('\n=== TESTING CLOUDINARY CONNECTION ===\n');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test with a simple URL upload
const testUrl = 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Test';

console.log('Testing upload with URL:', testUrl);
console.log('This should work without authentication issues...\n');

cloudinary.uploader.upload(testUrl, {
  folder: 'medclinic/test',
  public_id: 'test_upload_' + Date.now()
})
.then(result => {
  console.log('✅ SUCCESS! Upload works!');
  console.log('URL:', result.secure_url);
  console.log('Public ID:', result.public_id);
  console.log('\n✅ Your Cloudinary credentials are CORRECT!\n');
  
  // Clean up test image
  return cloudinary.uploader.destroy(result.public_id);
})
.then(() => {
  console.log('✅ Test image cleaned up');
  process.exit(0);
})
.catch(err => {
  console.error('\n❌ FAILED! Error:', err.message);
  console.error('\n🔍 This means your API Secret is INCORRECT!');
  console.error('\nPlease follow these steps:');
  console.error('1. Go to: https://console.cloudinary.com/console');
  console.error('2. Find "API Secret" (it shows as ***********)');
  console.error('3. Click the EYE ICON or "Click to reveal"');
  console.error('4. Copy the EXACT secret (usually 20-30 characters)');
  console.error('5. Paste it in .env as: CLOUDINARY_API_SECRET=your_secret_here');
  console.error('6. Make sure there are NO spaces before or after');
  console.error('7. Restart the server\n');
  process.exit(1);
});
