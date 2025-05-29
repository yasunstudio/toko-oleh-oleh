import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

// Critical: Ensure File constructor is globally available in Node.js environments
if (typeof globalThis.File === 'undefined') {
  try {
    const { File } = require('formdata-polyfill/esm')
    globalThis.File = File
    console.log('✅ File constructor polyfilled globally')
  } catch (error) {
    console.error('❌ Failed to polyfill File globally:', error)
  }
}

// Ensure File constructor is available in Node.js environments
let FileConstructor: typeof File
if (typeof File !== 'undefined') {
  FileConstructor = File
  console.log('✅ Using native File constructor')
} else {
  // Use formdata-polyfill for Node.js environments
  try {
    const { File: PolyfillFile } = require('formdata-polyfill/esm')
    FileConstructor = PolyfillFile
    console.log('✅ Using formdata-polyfill File constructor')
  } catch (error) {
    console.error('❌ Failed to load formdata-polyfill:', error)
    
    // Enhanced fallback: Create a comprehensive File-like constructor
    FileConstructor = class FilePolyfill implements File {
      name: string
      size: number
      type: string
      lastModified: number
      webkitRelativePath: string = ''
      
      constructor(fileBits: BlobPart[], filename: string, options: FilePropertyBag = {}) {
        this.name = filename
        this.type = options.type || 'application/octet-stream'
        this.lastModified = options.lastModified || Date.now()
        
        // Calculate size from fileBits
        this.size = fileBits.reduce((total, bit) => {
          if (bit instanceof ArrayBuffer) {
            return total + bit.byteLength
          } else if (bit instanceof Uint8Array) {
            return total + bit.length
          } else if (typeof bit === 'string') {
            return total + new TextEncoder().encode(bit).length
          } else if (bit && typeof (bit as any).length === 'number') {
            return total + (bit as any).length
          }
          return total
        }, 0)
      }
      
      // Required Blob methods
      arrayBuffer(): Promise<ArrayBuffer> {
        // This should never be called in our usage but implementing for completeness
        return Promise.resolve(new ArrayBuffer(0))
      }
      
      slice(start?: number, end?: number, contentType?: string): Blob {
        // Minimal implementation
        return new (this.constructor as any)([], this.name, { type: contentType || this.type })
      }
      
      stream(): ReadableStream<Uint8Array> {
        // Minimal implementation
        return new ReadableStream({
          start(controller) {
            controller.close()
          }
        })
      }
      
      text(): Promise<string> {
        return Promise.resolve('')
      }
    } as any
    console.log('⚠️ Using enhanced fallback File constructor')
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

    // Upload to UploadThing with retry mechanism
    let uploadAttempts = 0
    const maxAttempts = 3
    
    while (uploadAttempts < maxAttempts) {
      try {
        uploadAttempts++
        console.log(`🔄 Upload attempt ${uploadAttempts}/${maxAttempts}`)
        
        // Use UploadThing's uploadFilesFromBuffer method (Node.js server-side approach)
        try {
          console.log('🧪 Attempting uploadFilesFromBuffer method...')
          
          // Try the uploadFilesFromBuffer method if available
          if (typeof (utapi as any).uploadFilesFromBuffer === 'function') {
            const response = await (utapi as any).uploadFilesFromBuffer([{
              name: fileName,
              data: buffer,
              type: mimeType
            }])
            
            if (response && response[0] && response[0].data && response[0].data.url) {
              const url = response[0].data.url
              console.log(`✅ UploadThing buffer upload successful: ${url}`)
              return url
            }
          }
        } catch (bufferError) {
          console.log('❌ uploadFilesFromBuffer not available, trying File constructor approach...')
        }
        
        // Fallback: Create a proper File object using polyfill
        console.log('🔄 Creating File object with polyfill...')
        const file = new FileConstructor([buffer], fileName, {
          type: mimeType
        })

        const response = await utapi.uploadFiles([file])
        
        if (response && response[0] && response[0].data && response[0].data.url) {
          const url = response[0].data.url
          console.log(`✅ UploadThing upload successful: ${url}`)
          
          // Verify the URL format is correct
          if (url.includes('utfs.io') || url.includes('uploadthing')) {
            return url
          } else {
            console.error(`❌ Invalid UploadThing URL format: ${url}`)
          }
        } else {
          console.error(`❌ UploadThing upload failed (attempt ${uploadAttempts}):`, response[0]?.error)
        }
        
        // Wait before retry
        if (uploadAttempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts))
        }
        
      } catch (uploadError) {
        console.error(`❌ UploadThing upload error (attempt ${uploadAttempts}):`, uploadError)
        if (uploadAttempts === maxAttempts) {
          throw uploadError
        }
        
        // If this is a File constructor error, wait and retry
        if (uploadError instanceof ReferenceError && uploadError.message.includes('File is not defined')) {
          console.log('🔄 File constructor error detected, retrying with extended polyfill...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    
    return null
    
  } catch (error) {
    console.error('❌ UploadThing critical error:', error)
    return null
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