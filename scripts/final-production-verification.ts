#!/usr/bin/env tsx

/**
 * Final Production Verification Script
 * Comprehensive check of all application features and endpoints
 */

const PRODUCTION_URL = 'https://toko-oleh-oleh-production.up.railway.app';

interface ProductionTestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  responseTime?: number;
}

async function testEndpoint(endpoint: string, description: string): Promise<ProductionTestResult> {
  const start = Date.now();
  try {
    const response = await fetch(`${PRODUCTION_URL}${endpoint}`);
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return {
        test: description,
        status: 'PASS',
        message: `✅ ${description} - Status: ${response.status}`,
        responseTime
      };
    } else {
      return {
        test: description,
        status: 'FAIL',
        message: `❌ ${description} - Status: ${response.status}`
      };
    }
  } catch (error) {
    return {
      test: description,
      status: 'FAIL',
      message: `❌ ${description} - Error: ${error}`
    };
  }
}

async function testDatabaseEndpoints(): Promise<ProductionTestResult[]> {
  console.log('🔍 Testing Database Endpoints...\n');
  
  const tests = [
    { endpoint: '/api/health', description: 'Health Check' },
    { endpoint: '/api/products', description: 'Products API' },
    { endpoint: '/api/categories', description: 'Categories API' },
    { endpoint: '/api/products?category=bumbu-rempah', description: 'Products by Category' },
    { endpoint: '/api/products?search=sambal', description: 'Product Search' },
  ];

  const results: ProductionTestResult[] = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.description);
    console.log(`${result.message} ${result.responseTime ? `(${result.responseTime}ms)` : ''}`);
    results.push(result);
  }
  
  return results;
}

async function testPageLoads(): Promise<ProductionTestResult[]> {
  console.log('\n📱 Testing Page Loads...\n');
  
  const pages = [
    { endpoint: '/', description: 'Homepage' },
    { endpoint: '/products', description: 'Products Page' },
    { endpoint: '/products/sambal-roa-manado', description: 'Product Detail Page' },
    { endpoint: '/auth/signin', description: 'Sign In Page' },
    { endpoint: '/auth/signup', description: 'Sign Up Page' },
    { endpoint: '/admin/login', description: 'Admin Login Page' },
  ];

  const results: ProductionTestResult[] = [];
  
  for (const page of pages) {
    const result = await testEndpoint(page.endpoint, page.description);
    console.log(`${result.message} ${result.responseTime ? `(${result.responseTime}ms)` : ''}`);
    results.push(result);
  }
  
  return results;
}

async function checkHeroSlides(): Promise<ProductionTestResult> {
  console.log('\n🎨 Testing Hero Slides...\n');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/hero-slides`);
    if (response.ok) {
      const data = await response.json();
      const slideCount = data.length || 0;
      
      if (slideCount >= 3) {
        console.log(`✅ Hero Slides - Found ${slideCount} active slides`);
        return {
          test: 'Hero Slides',
          status: 'PASS',
          message: `✅ Hero Slides - ${slideCount} slides active`
        };
      } else {
        console.log(`⚠️ Hero Slides - Only ${slideCount} slides found (expected 3+)`);
        return {
          test: 'Hero Slides',
          status: 'FAIL',
          message: `⚠️ Hero Slides - Insufficient slides (${slideCount}/3)`
        };
      }
    } else {
      return {
        test: 'Hero Slides',
        status: 'FAIL',
        message: `❌ Hero Slides API - Status: ${response.status}`
      };
    }
  } catch (error) {
    return {
      test: 'Hero Slides',
      status: 'FAIL',
      message: `❌ Hero Slides API - Error: ${error}`
    };
  }
}

async function generateReport(allResults: ProductionTestResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL PRODUCTION VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log(`🌐 Application URL: ${PRODUCTION_URL}`);
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  const passCount = allResults.filter(r => r.status === 'PASS').length;
  const failCount = allResults.filter(r => r.status === 'FAIL').length;
  const totalTests = allResults.length;
  
  console.log(`\n📈 Overall Results:`);
  console.log(`✅ Passed: ${passCount}/${totalTests} (${Math.round((passCount/totalTests)*100)}%)`);
  console.log(`❌ Failed: ${failCount}/${totalTests} (${Math.round((failCount/totalTests)*100)}%)`);
  
  if (failCount > 0) {
    console.log(`\n⚠️ Failed Tests:`);
    allResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => console.log(`   ${r.message}`));
  }
  
  const avgResponseTime = allResults
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
    allResults.filter(r => r.responseTime).length;
  
  if (avgResponseTime) {
    console.log(`\n⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (passCount === totalTests) {
    console.log('🎉 ALL TESTS PASSED - PRODUCTION READY! 🎉');
  } else {
    console.log('⚠️ SOME TESTS FAILED - NEEDS ATTENTION');
  }
  
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Starting Final Production Verification...\n');
  console.log(`🌐 Testing: ${PRODUCTION_URL}\n`);
  
  try {
    const databaseResults = await testDatabaseEndpoints();
    const pageResults = await testPageLoads();
    const heroResult = await checkHeroSlides();
    
    const allResults = [...databaseResults, ...pageResults, heroResult];
    
    await generateReport(allResults);
    
    const failCount = allResults.filter(r => r.status === 'FAIL').length;
    process.exit(failCount > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
