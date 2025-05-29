#!/usr/bin/env node

// Test Hero Slide Upload with Authentication in Railway Production
require('dotenv').config({path: '.env.local'});

const https = require('https');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://toko-oleh-oleh-production.up.railway.app';

// Admin credentials from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tokooleholeh.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function testAuthenticatedUpload() {
  console.log('🧪 TESTING AUTHENTICATED HERO SLIDE UPLOAD IN PRODUCTION');
  console.log('========================================================');
  console.log(`📡 Production URL: ${PRODUCTION_URL}`);
  console.log(`👤 Admin Email: ${ADMIN_EMAIL}`);
  console.log('');

  try {
    // Step 1: Test basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const healthCheck = await makeRequest('GET', '/api/health');
    console.log(`✅ Basic connectivity: ${healthCheck.status}`);
    console.log('');

    // Step 2: Login as admin
    console.log('2️⃣ Logging in as admin...');
    const loginData = {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    };

    const loginResponse = await makeRequest('POST', '/api/auth/signin', loginData);
    console.log(`✅ Login response status: ${loginResponse.status}`);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed. Cannot proceed with authenticated test.');
      console.log('Response:', loginResponse.data);
      return;
    }

    // Extract session cookie if available
    const sessionCookie = extractSessionCookie(loginResponse.headers);
    console.log(`🍪 Session cookie: ${sessionCookie ? 'Available' : 'Not found'}`);
    console.log('');

    // Step 3: Test File constructor polyfill endpoint
    console.log('3️⃣ Testing File constructor polyfill...');
    const polyfillResponse = await makeRequest('GET', '/api/test-file-polyfill', null, sessionCookie);
    console.log(`✅ File polyfill test: ${polyfillResponse.status}`);
    
    if (polyfillResponse.data) {
      try {
        const polyfillData = JSON.parse(polyfillResponse.data);
        console.log('📊 Polyfill Results:', {
          fileConstructorAvailable: polyfillData.fileConstructorAvailable,
          polyfillLoaded: polyfillData.polyfillLoaded,
          testFileCreation: polyfillData.testFileCreation,
          nodeVersion: polyfillData.nodeVersion
        });
      } catch (e) {
        console.log('📄 Raw polyfill response:', polyfillResponse.data);
      }
    }
    console.log('');

    // Step 4: Create a test image buffer
    console.log('4️⃣ Creating test image for upload...');
    const testImageBuffer = createTestImageBuffer();
    console.log(`📁 Test image created: ${testImageBuffer.length} bytes`);
    console.log('');

    // Step 5: Test hero slide upload via /api/upload
    console.log('5️⃣ Testing hero slide upload via /api/upload...');
    const uploadResponse = await uploadTestImage(testImageBuffer, sessionCookie);
    console.log(`✅ Upload response status: ${uploadResponse.status}`);
    
    if (uploadResponse.data) {
      try {
        const uploadData = JSON.parse(uploadResponse.data);
        console.log('📊 Upload Results:', uploadData);
        
        if (uploadData.urls && uploadData.urls.length > 0) {
          console.log('🎉 UPLOAD SUCCESS! File URLs:', uploadData.urls);
          
          // Check if URL uses UploadThing (utfs.io) or fallback
          const url = uploadData.urls[0];
          if (url.includes('utfs.io')) {
            console.log('✅ SUCCESS: UploadThing cloud storage used!');
          } else if (url.includes('/uploads/')) {
            console.log('⚠️  FALLBACK: Local storage used (UploadThing failed)');
          } else {
            console.log('❓ UNKNOWN: Unexpected URL format');
          }
        } else {
          console.log('❌ UPLOAD FAILED: No URLs returned');
        }
      } catch (e) {
        console.log('📄 Raw upload response:', uploadResponse.data);
      }
    }
    console.log('');

    // Step 6: Test UploadThing endpoint directly
    console.log('6️⃣ Testing UploadThing endpoint directly...');
    const utResponse = await makeRequest('POST', '/api/uploadthing', {
      files: [{ name: "test.jpg", size: 1000, type: "image/jpeg" }],
      input: {}
    }, sessionCookie);
    console.log(`✅ UploadThing endpoint: ${utResponse.status}`);
    
    if (utResponse.data) {
      console.log('📄 UploadThing response preview:', utResponse.data.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }

  console.log('');
  console.log('========================================================');
  console.log('🏁 TEST COMPLETE');
  console.log('========================================================');
}

function makeRequest(method, path, data = null, cookie = null) {
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

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

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

function uploadTestImage(imageBuffer, cookie) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/upload', PRODUCTION_URL);
    const boundary = '----formdata-test-' + Math.random().toString(16);
    
    const formData = createMultipartFormData([{
      name: 'images',
      filename: 'test-hero-slide.jpg',
      contentType: 'image/jpeg',
      data: imageBuffer
    }], boundary);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formData.length,
        'User-Agent': 'Node.js Test Client'
      }
    };

    if (cookie) {
      options.headers['Cookie'] = cookie;
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

    req.write(formData);
    req.end();
  });
}

function createMultipartFormData(files, boundary) {
  let formData = '';
  
  files.forEach((file) => {
    formData += `--${boundary}\r\n`;
    formData += `Content-Disposition: form-data; name="${file.name}"; filename="${file.filename}"\r\n`;
    formData += `Content-Type: ${file.contentType}\r\n\r\n`;
    formData += file.data.toString('binary');
    formData += '\r\n';
  });
  
  formData += `--${boundary}--\r\n`;
  
  return Buffer.from(formData, 'binary');
}

function extractSessionCookie(headers) {
  const setCookieHeader = headers['set-cookie'];
  if (!setCookieHeader) return null;
  
  for (const cookie of setCookieHeader) {
    if (cookie.includes('next-auth') || cookie.includes('session')) {
      return cookie.split(';')[0];
    }
  }
  return null;
}

function createTestImageBuffer() {
  // Create a minimal 1x1 pixel JPEG buffer for testing
  return Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02,
    0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00,
    0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0xD2, 0xFF, 0xD9
  ]);
}

// Run the test
testAuthenticatedUpload().catch(console.error);
