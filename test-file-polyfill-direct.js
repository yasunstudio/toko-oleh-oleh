#!/usr/bin/env node

// Test File Constructor Polyfill Directly in Railway Production
require('dotenv').config({path: '.env.local'});

const https = require('https');

const PRODUCTION_URL = 'https://toko-oleh-oleh-production.up.railway.app';

async function testFilePolyfillDirect() {
  console.log('🧪 TESTING FILE CONSTRUCTOR POLYFILL IN RAILWAY PRODUCTION');
  console.log('========================================================');
  console.log(`📡 Production URL: ${PRODUCTION_URL}`);
  console.log('');

  try {
    // Test 1: Check if our polyfill test endpoint exists
    console.log('1️⃣ Testing File constructor polyfill endpoint...');
    const polyfillResponse = await makeRequest('GET', '/api/test-file-polyfill');
    console.log(`✅ Response status: ${polyfillResponse.status}`);
    
    if (polyfillResponse.status === 200) {
      try {
        const polyfillData = JSON.parse(polyfillResponse.data);
        console.log('📊 File Polyfill Status:', {
          fileConstructorAvailable: polyfillData.fileConstructorAvailable,
          polyfillLoaded: polyfillData.polyfillLoaded,
          testFileCreation: polyfillData.testFileCreation,
          nodeVersion: polyfillData.nodeVersion,
          environment: polyfillData.environment
        });
        
        if (polyfillData.fileConstructorAvailable && polyfillData.testFileCreation) {
          console.log('🎉 SUCCESS: File constructor is working with polyfill!');
        } else {
          console.log('❌ ISSUE: File constructor polyfill has problems');
        }
      } catch (e) {
        console.log('📄 Raw response:', polyfillResponse.data);
      }
    } else {
      console.log('❌ Polyfill test endpoint not available');
      console.log('📄 Response:', polyfillResponse.data);
    }
    console.log('');

    // Test 2: Test the upload endpoint without authentication to see File constructor behavior
    console.log('2️⃣ Testing upload endpoint File constructor behavior...');
    const uploadResponse = await makeRequest('POST', '/api/upload', {
      test: 'file-constructor-check'
    });
    console.log(`✅ Upload endpoint status: ${uploadResponse.status}`);
    
    if (uploadResponse.data) {
      console.log('📄 Upload response preview:', uploadResponse.data.substring(0, 300));
      
      // Look for our File constructor error
      if (uploadResponse.data.includes('File is not defined')) {
        console.log('❌ FOUND: "File is not defined" error still exists!');
      } else if (uploadResponse.data.includes('Unauthorized')) {
        console.log('✅ GOOD: No File constructor error (got expected auth error)');
      } else {
        console.log('✅ No File constructor error detected');
      }
    }
    console.log('');

    // Test 3: Check Node.js version and environment
    console.log('3️⃣ Checking Node.js environment...');
    const envResponse = await makeRequest('GET', '/api/health');
    console.log(`✅ Health check status: ${envResponse.status}`);
    console.log('');

    // Test 4: Test UploadThing configuration
    console.log('4️⃣ Testing UploadThing configuration...');
    const utResponse = await makeRequest('GET', '/api/uploadthing');
    console.log(`✅ UploadThing config status: ${utResponse.status}`);
    
    if (utResponse.data && utResponse.data.includes('File is not defined')) {
      console.log('❌ FOUND: UploadThing also has File constructor issues');
    } else {
      console.log('✅ UploadThing configuration appears normal');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }

  console.log('');
  console.log('========================================================');
  console.log('🏁 FILE POLYFILL TEST COMPLETE');
  console.log('========================================================');
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PRODUCTION_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Test Client'
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run the test
testFilePolyfillDirect().catch(console.error);
