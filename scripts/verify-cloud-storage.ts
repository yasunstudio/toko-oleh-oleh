import fetch from 'node-fetch'

async function testImageUrl(url: string): Promise<{ working: boolean; status?: number; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageVerifier/1.0)'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const isImage = response.headers.get('content-type')?.startsWith('image/');
    return {
      working: response.ok && !!isImage,
      status: response.status
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      working: false,
      error: errorMessage
    };
  }
}

async function verifyCloudStorage() {
  console.log('🔍 Verifying UploadThing cloud storage accessibility...')
  console.log('📡 Testing without database connection\n')
  
  // Known UploadThing image URLs from the migration
  const sampleUrls = [
    'https://utfs.io/f/c17df8de-6bcf-4e6c-b57a-bb4e3ee8de7c-j9sdm6.jpeg',
    'https://utfs.io/f/c17df8de-6bcf-4e6c-b57a-bb4e3ee8de7c-j9sdmb.jpeg',
    'https://utfs.io/f/c17df8de-6bcf-4e6c-b57a-bb4e3ee8de7c-j9sdmc.jpeg',
    'https://utfs.io/f/c17df8de-6bcf-4e6c-b57a-bb4e3ee8de7c-j9sdmd.jpeg',
    'https://utfs.io/f/c17df8de-6bcf-4e6c-b57a-bb4e3ee8de7c-j9sdme.jpeg'
  ]
  
  let workingImages = 0
  let totalTested = sampleUrls.length
  
  console.log(`🧪 Testing ${totalTested} sample cloud images...\n`)
  
  for (let i = 0; i < sampleUrls.length; i++) {
    const url = sampleUrls[i]
    process.stdout.write(`⏳ Testing image ${i + 1}/${totalTested}...`)
    
    const result = await testImageUrl(url)
    
    if (result.working) {
      workingImages++
      console.log(`\r✅ Sample ${i + 1}: ${url.substring(0, 70)}...`)
    } else {
      const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (HTTP ${result.status})` : ''
      console.log(`\r❌ Sample ${i + 1}: ${url}${errorInfo}`)
    }
  }
  
  console.log(`\n📊 Cloud Storage Test Results:`)
  console.log(`📈 Sample images tested: ${totalTested}`)
  console.log(`✅ Working images: ${workingImages}`)
  console.log(`❌ Failed images: ${totalTested - workingImages}`)
  console.log(`📊 Success rate: ${Math.round((workingImages / totalTested) * 100)}%`)
  
  if (workingImages === totalTested) {
    console.log(`\n🎉 UploadThing cloud storage is working perfectly!`)
    console.log(`🚀 Railway deployment images should be accessible!`)
    console.log(`🌐 Check production site: https://oleh-oleh-production.up.railway.app`)
  } else if (workingImages > 0) {
    console.log(`\n⚠️  Partial success - some images are working`)
    console.log(`🔍 This might indicate temporary network issues`)
  } else {
    console.log(`\n❌ No images are accessible`)
    console.log(`🔍 Check internet connection and UploadThing service status`)
  }
}

verifyCloudStorage().catch(console.error)
