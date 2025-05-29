/**
 * FetchError Diagnosis Script for UploadThing
 * 
 * This script helps diagnose and reproduce FetchError issues
 * specifically encountered on Railway production
 */

import { createReadStream } from 'fs';
import { join } from 'path';

interface FetchTestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  details: any;
  timestamp: string;
}

const results: FetchTestResult[] = [];

function logResult(test: string, status: 'PASS' | 'FAIL' | 'ERROR', details: any) {
  const result: FetchTestResult = {
    test,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  results.push(result);
  
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${test}:`, details);
}

async function testUploadThingConnectivity() {
  console.log('🔍 Testing UploadThing Connectivity...\n');
  
  try {
    // Test 1: Check environment variables
    const hasSecret = !!process.env.UPLOADTHING_SECRET;
    const hasAppId = !!process.env.UPLOADTHING_APP_ID;
    const hasToken = !!process.env.UPLOADTHING_TOKEN;
    
    logResult('Environment Variables Check', 
      hasSecret && hasAppId && hasToken ? 'PASS' : 'FAIL',
      { hasSecret, hasAppId, hasToken }
    );
    
    // Test 2: Basic fetch to UploadThing API
    try {
      console.log('\n🌐 Testing basic UploadThing API connectivity...');
      
      const response = await fetch('https://uploadthing.com/api/health', {
        method: 'GET',
        headers: {
          'User-Agent': 'UploadThing-Test/1.0'
        }
      });
      
      logResult('UploadThing API Health Check', 
        response.ok ? 'PASS' : 'FAIL',
        { 
          status: response.status,
          statusText: response.statusText,
          url: response.url
        }
      );
      
    } catch (fetchError) {
      logResult('UploadThing API Health Check', 'ERROR', {
        name: (fetchError as any).name,
        message: (fetchError as any).message,
        cause: (fetchError as any).cause,
        code: (fetchError as any).code,
        type: (fetchError as any).type
      });
    }
    
    // Test 3: Test upload endpoint accessibility
    if (hasSecret && hasAppId) {
      try {
        console.log('\n📤 Testing UploadThing upload endpoint...');
        
        const uploadResponse = await fetch(`https://uploadthing.com/api/uploadFiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Uploadthing-Api-Key': process.env.UPLOADTHING_SECRET!,
          },
          body: JSON.stringify({
            files: [],
            metadata: {}
          })
        });
        
        logResult('UploadThing Upload Endpoint Test', 
          uploadResponse.status < 500 ? 'PASS' : 'FAIL',
          { 
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            headers: Object.fromEntries(uploadResponse.headers.entries())
          }
        );
        
      } catch (uploadError) {
        logResult('UploadThing Upload Endpoint Test', 'ERROR', {
          name: (uploadError as any).name,
          message: (uploadError as any).message,
          cause: (uploadError as any).cause,
          code: (uploadError as any).code,
          type: (uploadError as any).type
        });
      }
    }
    
    // Test 4: Network configuration check
    console.log('\n🔧 Testing network configuration...');
    
    const networkTests = [
      'https://google.com',
      'https://github.com',
      'https://sea1.ingest.uploadthing.com'
    ];
    
    for (const url of networkTests) {
      try {
        const netResponse = await fetch(url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        
        logResult(`Network Test: ${url}`, 
          netResponse.ok ? 'PASS' : 'FAIL',
          { status: netResponse.status }
        );
        
      } catch (netError) {
        logResult(`Network Test: ${url}`, 'ERROR', {
          name: (netError as any).name,
          message: (netError as any).message
        });
      }
    }
    
  } catch (error) {
    console.error('🚨 Critical test error:', error);
  }
}

async function generateDiagnosisReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FETCHERROR DIAGNOSIS REPORT');
  console.log('='.repeat(60));
  
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`\n📈 Test Summary:`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);
  console.log(`📊 Total Tests: ${results.length}`);
  
  console.log(`\n🔍 Detailed Results:`);
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.test}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Time: ${result.timestamp}`);
    console.log(`   Details:`, JSON.stringify(result.details, null, 2));
  });
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  
  if (failCount > 0 || errorCount > 0) {
    console.log(`❗ Issues detected:`);
    
    const envIssues = results.find(r => r.test === 'Environment Variables Check' && r.status !== 'PASS');
    if (envIssues) {
      console.log(`   - Missing environment variables. Check Railway dashboard.`);
    }
    
    const networkIssues = results.filter(r => r.test.includes('Network Test') && r.status === 'ERROR');
    if (networkIssues.length > 0) {
      console.log(`   - Network connectivity issues detected.`);
      console.log(`   - Check Railway's outbound network policies.`);
    }
    
    const fetchErrors = results.filter(r => r.details?.name === 'FetchError');
    if (fetchErrors.length > 0) {
      console.log(`   - FetchError detected in ${fetchErrors.length} tests.`);
      console.log(`   - This indicates network/DNS resolution issues.`);
      console.log(`   - Check Railway's DNS settings and network policies.`);
    }
  } else {
    console.log(`✅ All tests passed! Network connectivity appears normal.`);
  }
  
  console.log(`\n🔗 Next Steps:`);
  console.log(`1. Run this script on Railway: railway run npm run test:fetcherror`);
  console.log(`2. Compare results between local and production`);
  console.log(`3. Check Railway logs during upload attempts`);
  console.log(`4. Monitor UploadThing dashboard for errors`);
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
  console.log('🧪 FetchError Diagnosis Tool for UploadThing');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Timestamp:', new Date().toISOString());
  console.log('');
  
  await testUploadThingConnectivity();
  await generateDiagnosisReport();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runFetchErrorDiagnosis };
