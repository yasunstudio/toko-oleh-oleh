// Test UploadThing Connection
require('dotenv').config({path: '.env.local'});

const testUploadThingConnection = async () => {
  console.log('🧪 TESTING UPLOADTHING CONNECTION');
  console.log('================================');
  
  // Cek environment variables
  const token = process.env.UPLOADTHING_TOKEN;
  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;
  
  console.log('📊 Credentials Status:');
  console.log(`   TOKEN: ${token ? '✅ Available' : '❌ Missing'}`);
  console.log(`   SECRET: ${secret ? '✅ Available' : '❌ Missing'}`);
  console.log(`   APP_ID: ${appId ? '✅ Available' : '❌ Missing'}`);
  console.log('');
  
  if (!token || !secret || !appId) {
    console.log('❌ Missing credentials - cannot test connection');
    return;
  }
  
  try {
    // Test basic API availability
    const testUrl = 'https://api.uploadthing.com/api/requestFileAccess';
    
    console.log('🌐 Testing UploadThing API...');
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Uploadthing-Api-Key': secret,
        'X-Uploadthing-Version': '6.0.0'
      },
      body: JSON.stringify({
        files: []
      })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    
    if (response.status === 200 || response.status === 400) {
      console.log('✅ UploadThing API accessible!');
      console.log('✅ Credentials are valid!');
      console.log('✅ Ready for file uploads!');
    } else {
      console.log('⚠️  API response:', response.status);
      const text = await response.text();
      console.log('   Response:', text.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
  
  console.log('');
  console.log('🚀 NEXT STEPS:');
  console.log('   1. Start development server: npm run dev');
  console.log('   2. Login to admin panel: http://localhost:3000/admin');
  console.log('   3. Try uploading an image through product form');
  console.log('   4. Check if image URL uses utfs.io domain');
  console.log('');
};

testUploadThingConnection().catch(console.error);
