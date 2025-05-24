import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function uploadToUploadthink(buffer: Buffer, fileName: string): Promise<string> {
  // Fallback: return URL lokal agar proses input produk tetap berjalan
  return `/uploads/${fileName}`;
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

      // Save file
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.type.split('/')[1]}`
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)

      // Upload to uploadthink and get cloud URL
      const uploadthinkUrl = await uploadToUploadthink(buffer, fileName)
      urls.push(uploadthinkUrl)
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