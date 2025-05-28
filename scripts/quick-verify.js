const PRODUCTION_URL = 'https://toko-oleh-oleh-production.up.railway.app';

async function quickTest() {
  console.log('🚀 Quick Production Verification');
  console.log('================================');
  console.log(`🌐 Testing: ${PRODUCTION_URL}\n`);
  
  const tests = [
    { url: '/api/health', name: 'Health Check' },
    { url: '/api/products', name: 'Products API' },
    { url: '/api/categories', name: 'Categories API' },
    { url: '/', name: 'Homepage' },
    { url: '/products', name: 'Products Page' },
    { url: '/admin/login', name: 'Admin Login' }
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(PRODUCTION_URL + test.url);
      if (response.ok) {
        console.log(`✅ PASS ${test.name} - Status: ${response.status}`);
        passCount++;
      } else {
        console.log(`❌ FAIL ${test.name} - Status: ${response.status}`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL ${test.name} - Error: Connection failed`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(40));
  console.log(`📊 Results: ${passCount} passed, ${failCount} failed`);
  console.log(`📈 Success Rate: ${Math.round((passCount/(passCount+failCount))*100)}%`);
  
  if (failCount === 0) {
    console.log('🎉 ALL TESTS PASSED - PRODUCTION READY!');
  } else {
    console.log('⚠️ Some tests failed - needs attention');
  }
  console.log('='.repeat(40));
}

quickTest().catch(console.error);
