// Test script to verify images are loading correctly on the website
const https = require('https')

async function testImageUrls() {
  console.log('🧪 Testing UploadThing image URLs...\n')
  
  // Sample URLs from our database
  const testUrls = [
    'https://utfs.io/f/sPrFi2oXJxbUbyCf5sfgkTi6bOnYsp8mC9eu7vMKwdoq5U1a', // rendang
    'https://utfs.io/f/sPrFi2oXJxbUmZjtd4uS5u4IMdNYJwrUVejZqXRBnfF123xv', // abon-sapi
    'https://utfs.io/f/sPrFi2oXJxbUoDHUs19fWJnx1vD04kyteXFjPUSVHslBc3gZ', // ikan-asin
    'https://utfs.io/f/sPrFi2oXJxbUyelCsVp4VOCszpZHva8fgKEblBFD2GMrnAY7', // category makanan-kering
    'https://utfs.io/f/sPrFi2oXJxbUzxpdJsilLmCGFT0Kx8jurD9VNnAsWiZ1eXRw'  // keripik-pisang
  ]
  
  let successCount = 0
  let failCount = 0
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i]
    const fileName = url.split('/').pop()
    
    try {
      await new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
          if (res.statusCode === 200) {
            console.log(`✅ ${i + 1}. ${fileName} - Status: ${res.statusCode} (${res.headers['content-type']})`)
            successCount++
          } else {
            console.log(`❌ ${i + 1}. ${fileName} - Status: ${res.statusCode}`)
            failCount++
          }
          resolve()
        })
        
        req.on('error', (err) => {
          console.log(`❌ ${i + 1}. ${fileName} - Error: ${err.message}`)
          failCount++
          resolve()
        })
        
        req.setTimeout(5000, () => {
          console.log(`⏰ ${i + 1}. ${fileName} - Timeout`)
          failCount++
          resolve()
        })
        
        req.end()
      })
    } catch (error) {
      console.log(`❌ ${i + 1}. ${fileName} - Exception: ${error.message}`)
      failCount++
    }
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 IMAGE URL TEST RESULTS')
  console.log('=' .repeat(50))
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📈 Success Rate: ${((successCount / testUrls.length) * 100).toFixed(1)}%`)
  
  if (successCount === testUrls.length) {
    console.log('\n🎉 All image URLs are working correctly!')
    console.log('🌐 Your UploadThing migration is successful!')
  } else {
    console.log('\n⚠️  Some image URLs are not working.')
    console.log('   Please check the URLs and UploadThing configuration.')
  }
}

testImageUrls().catch(console.error)
