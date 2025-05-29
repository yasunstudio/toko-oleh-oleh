import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to verify File constructor polyfill is working
export async function GET() {
  try {
    // Test if File constructor is available
    const fileConstructorAvailable = typeof File !== 'undefined'
    let polyfillLoaded = false
    let testFileCreation = false
    let errorMessage = null

    try {
      // Check if polyfill was loaded
      if (typeof File === 'undefined') {
        // Try to load polyfill
        global.File = require('formdata-polyfill/esm').File
        polyfillLoaded = true
      }

      // Test File constructor
      const testBuffer = Buffer.from('test data')
      const testFile = new File([testBuffer], 'test.txt', { type: 'text/plain' })
      testFileCreation = testFile instanceof File && testFile.name === 'test.txt'
    } catch (error) {
      errorMessage = error.message
    }

    return NextResponse.json({
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      fileConstructorAvailable,
      polyfillLoaded,
      testFileCreation,
      errorMessage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
