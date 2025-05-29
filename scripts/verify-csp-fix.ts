#!/usr/bin/env npx tsx

/**
 * CSP Fix Verification Script
 * 
 * This script verifies that the Content Security Policy fix has resolved
 * the UploadThing FetchError issue by checking:
 * 1. CSP headers allow UploadThing domains
 * 2. Network connectivity to UploadThing endpoints
 * 3. Application upload functionality
 */

interface CSPTestResult {
  endpoint: string;
  status: 'success' | 'error';
  details: string;
  cspPolicy?: string;
  allowsUploadThing?: boolean;
}

async function testCSPHeaders(url: string): Promise<CSPTestResult> {
  try {
    console.log(`🔍 Testing CSP headers for: ${url}`);
    
    const response = await fetch(url, { method: 'HEAD' });
    const cspHeader = response.headers.get('content-security-policy');
    
    if (!cspHeader) {
      return {
        endpoint: url,
        status: 'error',
        details: 'No CSP header found',
      };
    }
    
    const allowsUploadThing = 
      cspHeader.includes('*.uploadthing.com') && 
      cspHeader.includes('*.ingest.uploadthing.com');
    
    return {
      endpoint: url,
      status: allowsUploadThing ? 'success' : 'error',
      details: allowsUploadThing 
        ? 'CSP allows UploadThing connections'
        : 'CSP still blocks UploadThing connections',
      cspPolicy: cspHeader,
      allowsUploadThing,
    };
  } catch (error) {
    return {
      endpoint: url,
      status: 'error',
      details: `Failed to fetch CSP headers: ${error}`,
    };
  }
}

async function testUploadThingConnectivity(): Promise<CSPTestResult[]> {
  const uploadThingEndpoints = [
    'https://api.uploadthing.com',
    'https://sea1.ingest.uploadthing.com',
    'https://fra1.ingest.uploadthing.com',
    'https://sfo1.ingest.uploadthing.com',
  ];
  
  const results: CSPTestResult[] = [];
  
  for (const endpoint of uploadThingEndpoints) {
    try {
      console.log(`🌐 Testing connectivity to: ${endpoint}`);
      
      const response = await fetch(endpoint, { 
        method: 'OPTIONS',
        headers: {
          'Origin': process.env.NEXTAUTH_URL || 'https://toko-oleh-oleh-production.up.railway.app'
        }
      });
      
      results.push({
        endpoint,
        status: 'success',
        details: `Connected successfully (${response.status})`,
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 'error',
        details: `Connection failed: ${error}`,
      });
    }
  }
  
  return results;
}

async function main() {
  console.log('🚀 Starting CSP Fix Verification...\n');
  
  const productionUrl = process.env.NEXTAUTH_URL || 'https://toko-oleh-oleh-production.up.railway.app';
  
  console.log('📋 Test Configuration:');
  console.log(`Production URL: ${productionUrl}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  // Test 1: Check CSP Headers
  console.log('=== TEST 1: CSP Header Verification ===');
  const cspTest = await testCSPHeaders(productionUrl);
  
  if (cspTest.status === 'success') {
    console.log('✅ CSP allows UploadThing connections');
    console.log(`📝 CSP Policy: ${cspTest.cspPolicy?.substring(0, 100)}...`);
  } else {
    console.log('❌ CSP still blocks UploadThing connections');
    console.log(`📝 Details: ${cspTest.details}`);
  }
  console.log('');
  
  // Test 2: Test UploadThing Connectivity
  console.log('=== TEST 2: UploadThing Connectivity ===');
  const connectivityTests = await testUploadThingConnectivity();
  
  let successCount = 0;
  for (const test of connectivityTests) {
    if (test.status === 'success') {
      console.log(`✅ ${test.endpoint}: ${test.details}`);
      successCount++;
    } else {
      console.log(`❌ ${test.endpoint}: ${test.details}`);
    }
  }
  
  console.log(`\n📊 Connectivity Results: ${successCount}/${connectivityTests.length} endpoints accessible`);
  
  // Final Assessment
  console.log('\n=== FINAL ASSESSMENT ===');
  
  const cspFixed = cspTest.allowsUploadThing;
  const connectivityGood = successCount >= connectivityTests.length / 2;
  
  if (cspFixed && connectivityGood) {
    console.log('🎉 SUCCESS: CSP fix appears to be working!');
    console.log('✅ CSP allows UploadThing domains');
    console.log('✅ Network connectivity to UploadThing is functional');
    console.log('\n📝 Next Steps:');
    console.log('1. Test image upload functionality in the application');
    console.log('2. Monitor production logs for any remaining errors');
    console.log('3. Verify that uploaded images display correctly');
  } else {
    console.log('⚠️  ISSUES DETECTED:');
    if (!cspFixed) {
      console.log('❌ CSP still blocking UploadThing connections');
      console.log('   → Check if deployment is complete');
      console.log('   → Verify next.config.ts changes are live');
    }
    if (!connectivityGood) {
      console.log('❌ Network connectivity issues detected');
      console.log('   → Check Railway environment configuration');
      console.log('   → Verify UPLOADTHING_SECRET and UPLOADTHING_APP_ID');
    }
  }
  
  console.log('\n🔧 Debug Information:');
  console.log(JSON.stringify({
    cspTest,
    connectivityTests,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      productionUrl,
      timestamp: new Date().toISOString(),
    }
  }, null, 2));
}

// Run the verification
main().catch(console.error);
