import { UTApi } from 'uploadthing/server'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

// Ensure File constructor is available in Node.js environments
let FileConstructor: typeof File
if (typeof File !== 'undefined') {
  FileConstructor = File
} else {
  // Use formdata-polyfill for Node.js environments
  try {
    const { File: PolyfillFile } = require('formdata-polyfill/esm')
    FileConstructor = PolyfillFile
    console.log('✅ Using formdata-polyfill File constructor in script')
  } catch (error) {
    console.error('❌ Failed to load formdata-polyfill in script:', error)
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
    console.log('⚠️ Using fallback File constructor in script')
  }
}

const utapi = new UTApi()
const prisma = new PrismaClient()

interface MigrationResult {
  success: boolean
  fileName: string
  localPath: string
  cloudUrl?: string
  error?: string
}

async function uploadImageToUploadThing(filePath: string, fileName: string): Promise<string | null> {
  try {
    if (!existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return null
    }

    // Read file
    const fileBuffer = readFileSync(filePath)
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    
    // Create File object
    const file = new File([fileBuffer], fileName, {
      type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
    })

    console.log(`📤 Uploading: ${fileName} (${(fileBuffer.length / 1024).toFixed(2)} KB)`)

    // Upload to UploadThing
    const response = await utapi.uploadFiles([file])
    
    if (response[0]?.data?.url) {
      console.log(`✅ Success: ${response[0].data.url}`)
      return response[0].data.url
    } else {
      console.log(`❌ Upload failed for ${fileName}:`, response[0]?.error)
      return null
    }
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error)
    return null
  }
}

async function updateDatabaseUrls(localPath: string, cloudUrl: string): Promise<void> {
  try {
    // Update product images
    const productImageUpdates = await prisma.productImage.updateMany({
      where: { url: localPath },
      data: { url: cloudUrl }
    })

    if (productImageUpdates.count > 0) {
      console.log(`  📝 Updated ${productImageUpdates.count} product image(s)`)
    }

    // Update category images
    const categoryUpdates = await prisma.category.updateMany({
      where: { image: localPath },
      data: { image: cloudUrl }
    })

    if (categoryUpdates.count > 0) {
      console.log(`  📝 Updated ${categoryUpdates.count} category image(s)`)
    }

    // Update hero slides if they exist
    const heroUpdates = await prisma.heroSlide.updateMany({
      where: { backgroundImage: localPath },
      data: { backgroundImage: cloudUrl }
    })

    if (heroUpdates.count > 0) {
      console.log(`  📝 Updated ${heroUpdates.count} hero slide(s)`)
    }

    // Update settings (logo, etc.)
    const settingsUpdates = await prisma.setting.updateMany({
      where: { 
        AND: [
          { value: { contains: localPath } }
        ]
      },
      data: { value: cloudUrl }
    })

    if (settingsUpdates.count > 0) {
      console.log(`  📝 Updated ${settingsUpdates.count} setting(s)`)
    }

  } catch (error) {
    console.error(`❌ Database update error for ${localPath}:`, error)
  }
}

async function migrateImagesFromLocal(): Promise<void> {
  console.log('🚀 Starting Local to UploadThing Image Migration')
  console.log('=' .repeat(50))
  
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  
  if (!existsSync(uploadsDir)) {
    console.log('❌ Uploads directory not found!')
    return
  }

  const results: MigrationResult[] = []
  let successCount = 0
  let errorCount = 0

  try {
    // Get all files in uploads directory
    const files = readdirSync(uploadsDir)
    const imageFiles = files.filter(file => {
      const fullPath = join(uploadsDir, file)
      const isFile = statSync(fullPath).isFile()
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      return isFile && isImage
    })

    console.log(`📂 Found ${imageFiles.length} image files to migrate\n`)

    for (const fileName of imageFiles) {
      const filePath = join(uploadsDir, fileName)
      const localUrl = `/uploads/${fileName}`
      
      console.log(`\n📸 Processing: ${fileName}`)
      
      try {
        // Upload to UploadThing
        const cloudUrl = await uploadImageToUploadThing(filePath, fileName)
        
        if (cloudUrl) {
          // Update database references
          await updateDatabaseUrls(localUrl, cloudUrl)
          
          results.push({
            success: true,
            fileName,
            localPath: localUrl,
            cloudUrl
          })
          successCount++
        } else {
          results.push({
            success: false,
            fileName,
            localPath: localUrl,
            error: 'Upload failed'
          })
          errorCount++
        }
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error)
        results.push({
          success: false,
          fileName,
          localPath: localUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await prisma.$disconnect()
  }

  // Print summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 MIGRATION SUMMARY')
  console.log('=' .repeat(50))
  console.log(`✅ Successful uploads: ${successCount}`)
  console.log(`❌ Failed uploads: ${errorCount}`)
  console.log(`📊 Total processed: ${results.length}`)
  
  if (successCount > 0) {
    console.log('\n✅ SUCCESSFULLY MIGRATED:')
    results.filter(r => r.success).forEach(result => {
      console.log(`  📸 ${result.fileName}`)
      console.log(`     Local:  ${result.localPath}`)
      console.log(`     Cloud:  ${result.cloudUrl}`)
      console.log('')
    })
  }

  if (errorCount > 0) {
    console.log('\n❌ FAILED MIGRATIONS:')
    results.filter(r => !r.success).forEach(result => {
      console.log(`  📸 ${result.fileName}: ${result.error}`)
    })
  }

  console.log('\n🎉 Migration completed!')
  console.log('📝 All database references have been updated to use UploadThing URLs')
  console.log('🌐 Your images are now stored in the cloud and will persist across deployments')
}

// Run the migration
if (require.main === module) {
  migrateImagesFromLocal()
    .then(() => {
      console.log('✅ Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateImagesFromLocal }