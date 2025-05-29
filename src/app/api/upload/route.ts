import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

// Ensure File constructor is available in Node.js environments
let FileConstructor: typeof File
if (typeof File !== 'undefined') {
  FileConstructor = File
} else {
  // Use formdata-polyfill for Node.js environments
  try {
    const { File: PolyfillFile } = require('formdata-polyfill/esm')
    FileConstructor = PolyfillFile
    console.log('✅ Using formdata-polyfill File constructor')
  } catch (error) {
    console.error('❌ Failed to load formdata-polyfill:', error)
    // Fallback: Create a minimal File-like constructor
    FileConstructor = class FilePolyfill {
      name: string
      size: number
      type: string
      constructor(fileBits: any[], filename: string, options: any = {}) {
        this.name = filename
        this.size = fileBits[0]?.length || 0
        this.type = options.type || 'application/octet-stream'
      }
    } as any
    console.log('⚠️ Using fallback File constructor')
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

    // Upload to UploadThing with retry mechanism using uploadFilesFromBuffer
    let uploadAttempts = 0
    const maxAttempts = 3
    
    while (uploadAttempts < maxAttempts) {
      try {
        uploadAttempts++
        console.log(`🔄 Upload attempt ${uploadAttempts}/${maxAttempts}`)
        
        // Try using the buffer-based upload method first
        try {
          console.log('🧪 Attempting buffer-based upload...')
          // Create a File-like object manually for UploadThing
          const fileData = {
            name: fileName,
            size: buffer.length,
            type: mimeType,
            arrayBuffer: async () => buffer,
            stream: () => new ReadableStream({
              start(controller) {
                controller.enqueue(buffer)
                controller.close()
              }
            })
          }
          
          const response = await utapi.uploadFiles([fileData as any])
          
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
        } catch (bufferError) {
          console.log('❌ Buffer-based upload failed, trying File constructor approach...')
          
          // Fallback to File constructor approach
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