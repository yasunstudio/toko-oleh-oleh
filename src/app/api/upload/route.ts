import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

async function uploadToUploadthing(buffer: Buffer, fileName: string): Promise<string | null> {
  try {
    // Create a File object from buffer
    const file = new File([buffer], fileName, {
      type: `image/${fileName.split('.').pop()}`
    })

    // Upload to UploadThing
    const response = await utapi.uploadFiles([file])
    
    if (response[0]?.data?.url) {
      console.log(`✅ Image uploaded to UploadThing: ${response[0].data.url}`)
      return response[0].data.url
    } else {
      console.error('❌ UploadThing upload failed:', response[0]?.error)
      return null
    }
  } catch (error) {
    console.error('❌ UploadThing error:', error)
    return null
  }
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

      // Save file locally as backup
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.type.split('/')[1]}`
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)

      // Upload to UploadThing and get cloud URL
      const uploadthingUrl = await uploadToUploadthing(buffer, fileName);
      
      if (uploadthingUrl) {
        // Use UploadThing URL directly (trust the response)
        urls.push(uploadthingUrl);
        console.log(`✅ Successfully uploaded: ${uploadthingUrl}`);
      } else {
        // If UploadThing fails, use local URL as fallback
        const localUrl = `/uploads/${fileName}`;
        urls.push(localUrl);
        console.log(`⚠️ Using local fallback: ${localUrl}`);
      }
    }

    return NextResponse.json({ urls })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}