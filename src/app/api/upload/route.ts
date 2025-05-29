import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

// Ensure File constructor is available in Node.js environments
let FileConstructor: any

// Try multiple approaches to get File constructor
if (typeof File !== 'undefined') {
  FileConstructor = File
  console.log('✅ Using native File constructor')
} else {
  console.log('🔄 Native File not available, trying polyfills...')
  
  // Try formdata-polyfill first
  try {
    const polyfill = require('formdata-polyfill/esm')
    if (polyfill && polyfill.File) {
      FileConstructor = polyfill.File
      console.log('✅ Using formdata-polyfill File constructor')
    } else {
      throw new Error('formdata-polyfill.File not found')
    }
  } catch (polyfillError: any) {
    console.log('⚠️ formdata-polyfill failed:', polyfillError?.message || polyfillError)
    
    // Try global File polyfill
    try {
      const globalPolyfill = require('formdata-polyfill/esm')
      global.File = global.File || globalPolyfill.File
      FileConstructor = global.File
      console.log('✅ Using global File polyfill')
    } catch (globalError: any) {
      console.log('⚠️ Global File polyfill failed:', globalError?.message || globalError)
      
      // Create a comprehensive File-like constructor
      FileConstructor = class FilePolyfill {
        name: string
        size: number
        type: string
        lastModified: number
        webkitRelativePath: string
        
        constructor(fileBits: any[], filename: string, options: any = {}) {
          this.name = filename
          this.size = Array.isArray(fileBits) && fileBits[0] ? fileBits[0].length || 0 : 0
          this.type = options.type || 'application/octet-stream'
          this.lastModified = Date.now()
          this.webkitRelativePath = ''
          
          // Make it iterable like a real File
          Object.defineProperty(this, Symbol.toStringTag, {
            value: 'File',
            configurable: true
          })
        }
        
        // Add File-like methods
        stream() {
          throw new Error('stream() not implemented in polyfill')
        }
        
        arrayBuffer() {
          throw new Error('arrayBuffer() not implemented in polyfill') 
        }
        
        text() {
          throw new Error('text() not implemented in polyfill')
        }
        
        slice() {
          throw new Error('slice() not implemented in polyfill')
        }
      }
      console.log('⚠️ Using comprehensive fallback File constructor')
    }
  }
}

const utapi = new UTApi()

async function uploadToUploadthing(buffer: Buffer, fileName: string): Promise<string | null> {
  try {
    console.log(`🔄 Starting UploadThing upload for: ${fileName}`)
    
    // Get file extension for proper MIME type
    const extension = fileName.split('.').pop()?.toLowerCase()
    const mimeType = getMimeType(extension || '')
    
    console.log(`📁 File details: ${fileName}, Size: ${buffer.length}, Type: ${mimeType}`)
    console.log(`🔧 Using FileConstructor: ${FileConstructor.name || 'Unknown'}`)

    // Create a File object from buffer with proper MIME type
    // Using our polyfilled FileConstructor for Node.js compatibility
    let file: any
    try {
      file = new FileConstructor([buffer], fileName, {
        type: mimeType
      })
      console.log(`✅ File object created successfully: ${file.name}, ${file.size} bytes, ${file.type}`)
    } catch (fileCreateError: any) {
      console.error(`❌ Failed to create File object:`, fileCreateError?.message || fileCreateError)
      throw new Error(`File creation failed: ${fileCreateError?.message || 'Unknown error'}`)
    }

    // Upload to UploadThing with retry mechanism
    let uploadAttempts = 0
    const maxAttempts = 3
    
    while (uploadAttempts < maxAttempts) {
      try {
        uploadAttempts++
        console.log(`🔄 Upload attempt ${uploadAttempts}/${maxAttempts}`)
        
        const response = await utapi.uploadFiles([file])
        console.log(`📊 UploadThing response:`, JSON.stringify(response, null, 2))
        
        if (response && response[0] && response[0].data && response[0].data.url) {
          const url = response[0].data.url
          console.log(`✅ UploadThing upload successful: ${url}`)
          
          // Verify the URL format is correct
          if (url.includes('utfs.io') || url.includes('uploadthing')) {
            return url
          } else {
            console.error(`❌ Invalid UploadThing URL format: ${url}`)
            throw new Error(`Invalid URL format: ${url}`)
          }
        } else {
          const errorMsg = response[0]?.error || 'Unknown upload error'
          console.error(`❌ UploadThing upload failed (attempt ${uploadAttempts}):`, errorMsg)
          
          if (uploadAttempts === maxAttempts) {
            throw new Error(`Upload failed after ${maxAttempts} attempts: ${errorMsg}`)
          }
        }
        
        // Wait before retry
        if (uploadAttempts < maxAttempts) {
          const delay = 1000 * uploadAttempts
          console.log(`⏳ Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
        
      } catch (uploadError: any) {
        console.error(`❌ UploadThing upload error (attempt ${uploadAttempts}):`, uploadError?.message || uploadError)
        
        if (uploadAttempts === maxAttempts) {
          throw uploadError
        }
      }
    }
    
    return null
    
  } catch (error: any) {
    console.error('❌ UploadThing critical error:', error?.message || error)
    throw error // Re-throw instead of returning null to force proper error handling
  }
}

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp'
  }
  return mimeTypes[extension] || 'image/jpeg'
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const files = formData.getAll('images') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    const urls: string[] = []

    for (const file of files) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Only image files are allowed' },
          { status: 400 }
        )
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        return NextResponse.json(
          { error: 'File size must be less than 5MB' },
          { status: 400 }
        )
      }

      // Get file buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const extension = originalName.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`
      
      console.log(`🔄 Processing file: ${originalName} -> ${fileName}`)

      // Upload to UploadThing (primary)
      const uploadthingUrl = await uploadToUploadthing(buffer, fileName);
      
      if (uploadthingUrl) {
        // Use UploadThing URL (preferred)
        urls.push(uploadthingUrl);
        console.log(`✅ UploadThing success: ${uploadthingUrl}`);
      } else {
        // Fallback: save locally and return local URL
        console.log(`⚠️ UploadThing failed, using local fallback`);
        
        try {
          const filePath = join(uploadsDir, fileName)
          await writeFile(filePath, buffer)
          const localUrl = `/uploads/${fileName}`;
          urls.push(localUrl);
          console.log(`📁 Local fallback: ${localUrl}`);
        } catch (localError) {
          console.error(`❌ Local save failed:`, localError);
          return NextResponse.json(
            { error: `Failed to upload ${originalName}` },
            { status: 500 }
          )
        }
      }
    }

    console.log(`🎉 Upload complete. URLs:`, urls);
    return NextResponse.json({ 
      urls,
      success: true,
      count: urls.length
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}