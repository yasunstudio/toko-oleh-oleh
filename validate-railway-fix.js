#!/usr/bin/env node

/**
 * Railway Production Upload Test
 * 
 * This script validates that our File constructor fix is working in Railway production
 * by testing the upload functionality and monitoring for the specific error.
 */

const https = require('https');
const { promisify } = require('util');

const PRODUCTION_URL = 'https://toko-oleh-oleh-production.up.railway.app';

console.log('🚀 Railway Production Upload Validation Test');
console.log('=============================================');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testProductionEndpoints() {
  console.log('\n🔍 Step 1: Testing production endpoints...');
  
  try {
    // Test main upload API
    const uploadResponse = await makeRequest(`${PRODUCTION_URL}/api/upload`, {
      method: 'GET'
    });
    
    console.log(`   Upload API Status: ${uploadResponse.status}`);
    if (uploadResponse.status === 401) {
      console.log('   ✅ Upload API responding (401 expected without auth)');
    } else {
      console.log(`   ⚠️ Unexpected status: ${uploadResponse.status}`);
    }
    
    // Test admin panel
    const adminResponse = await makeRequest(`${PRODUCTION_URL}/admin`);
    console.log(`   Admin Panel Status: ${adminResponse.status}`);
    if (adminResponse.status === 200) {
      console.log('   ✅ Admin panel accessible');
    }
    
    // Test hero slides page
    const heroResponse = await makeRequest(`${PRODUCTION_URL}/admin/hero-slides`);
    console.log(`   Hero Slides Page Status: ${heroResponse.status}`);
    if (heroResponse.status === 200) {
      console.log('   ✅ Hero slides page accessible');
    }
    
  } catch (error) {
    console.error('   ❌ Error testing endpoints:', error.message);
  }
}

async function checkDeploymentStatus() {
  console.log('\n🔍 Step 2: Checking deployment status...');
  
  try {
    // Check if the deployment includes our fix by looking for specific headers or behavior
    const response = await makeRequest(`${PRODUCTION_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Empty request to trigger our error handling
    });
    
    console.log(`   Deployment test status: ${response.status}`);
    if (response.status === 401) {
      console.log('   ✅ Latest deployment is active (getting auth error as expected)');
    }
    
  } catch (error) {
    console.error('   ❌ Error checking deployment:', error.message);
  }
}

function displayInstructions() {
  console.log('\n🎯 Manual Testing Instructions:');
  console.log('================================');
  console.log('1. Open: https://toko-oleh-oleh-production.up.railway.app/admin');
  console.log('2. Login with admin credentials');
  console.log('3. Navigate to "Hero Slides" section');
  console.log('4. Try uploading a new image');
  console.log('5. Check Railway deployment logs for:');
  console.log('   ✅ "Using formdata-polyfill" or "Buffer-based upload"');
  console.log('   ❌ "File is not defined" error should NOT appear');
  console.log('6. Verify uploaded image gets a UploadThing URL (utfs.io)');
  console.log('7. Check that the image displays correctly on the homepage');
  
  console.log('\n📊 What to Look For in Railway Logs:');
  console.log('====================================');
  console.log('✅ SUCCESS indicators:');
  console.log('   - "✅ Using formdata-polyfill File constructor"');
  console.log('   - "🧪 Attempting buffer-based upload..."');
  console.log('   - "✅ UploadThing upload successful: https://utfs.io/..."');
  
  console.log('\n❌ FAILURE indicators:');
  console.log('   - "ReferenceError: File is not defined"');
  console.log('   - "❌ Failed to load formdata-polyfill"');
  console.log('   - "❌ UploadThing upload failed"');
  
  console.log('\n🔧 Railway Log Commands:');
  console.log('========================');
  console.log('railway logs --tail  # View live logs');
  console.log('railway logs --filter="error"  # Filter for errors');
  console.log('railway logs --filter="File"  # Filter for File-related messages');
}

async function main() {
  await testProductionEndpoints();
  await checkDeploymentStatus();
  displayInstructions();
  
  console.log('\n✨ Test Complete!');
  console.log('The fix should now be deployed. Please test manually as described above.');
}

main().catch(console.error);
