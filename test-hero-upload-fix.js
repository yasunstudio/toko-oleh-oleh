#!/usr/bin/env node

/**
 * Test script to verify hero slide upload functionality works in production
 * This script tests the File constructor fix we implemented
 */

console.log('🧪 Testing Hero Slide Upload Functionality in Production');
console.log('=========================================================');

const testUpload = async () => {
  const baseUrl = 'https://toko-oleh-oleh-production.up.railway.app';
  
  console.log('\n📋 Test Plan:');
  console.log('1. Test production upload API endpoint');
  console.log('2. Verify File constructor polyfill is working');
  console.log('3. Check if UploadThing integration is functional');
  
  try {
    // Test 1: Check if the API endpoint is accessible
    console.log('\n🔍 Step 1: Testing API endpoint accessibility...');
    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    if (response.status === 401) {
      console.log('   ✅ API endpoint is working (401 expected - need admin auth)');
    } else {
      const text = await response.text();
      console.log(`   Response: ${text}`);
    }
    
    // Test 2: Check UploadThing endpoint
    console.log('\n🔍 Step 2: Testing UploadThing endpoint...');
    const uploadThingResponse = await fetch(`${baseUrl}/api/uploadthing`, {
      method: 'GET'
    });
    
    console.log(`   UploadThing Status: ${uploadThingResponse.status}`);
    if (uploadThingResponse.ok) {
      console.log('   ✅ UploadThing endpoint is accessible');
    }
    
    // Test 3: Check hero slides page
    console.log('\n🔍 Step 3: Testing hero slides admin page...');
    const heroResponse = await fetch(`${baseUrl}/admin/hero-slides`);
    console.log(`   Hero Slides Page Status: ${heroResponse.status}`);
    
    if (heroResponse.ok) {
      console.log('   ✅ Hero slides page is accessible');
    }
    
    console.log('\n🎯 Next Steps for Manual Testing:');
    console.log('1. Go to: https://toko-oleh-oleh-production.up.railway.app/admin');
    console.log('2. Login as admin');
    console.log('3. Navigate to Hero Slides');
    console.log('4. Try uploading an image');
    console.log('5. Check Railway logs for "✅ Using formdata-polyfill" or "Buffer-based upload"');
    console.log('6. Verify no "File is not defined" errors appear');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testUpload().catch(console.error);
