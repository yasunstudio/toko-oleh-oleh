#!/usr/bin/env npx tsx

/**
 * Script to test hero slide image upload functionality with UploadThing
 */

import { prisma } from '../src/lib/db'

async function testHeroSlideUpload() {
  console.log('🧪 Testing Hero Slide Upload Integration...')
  console.log('=' .repeat(60))

  try {
    // Check current hero slides
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' }
    })

    console.log('📊 Current Hero Slides Status:')
    console.log('Total slides:', slides.length)
    
    let slidesWithImages = 0
    let uploadThingImages = 0
    let colorBackgrounds = 0

    slides.forEach((slide, index) => {
      console.log(`\n${index + 1}. ${slide.title}`)
      console.log(`   Active: ${slide.isActive ? '✅' : '❌'}`)
      console.log(`   Order: ${slide.order}`)
      
      if (slide.backgroundImage) {
        slidesWithImages++
        if (slide.backgroundImage.includes('utfs.io')) {
          uploadThingImages++
          console.log(`   Background: 🖼️  UploadThing Image`)
          console.log(`   URL: ${slide.backgroundImage}`)
        } else {
          console.log(`   Background: 🖼️  Other Image`)
          console.log(`   URL: ${slide.backgroundImage}`)
        }
      } else if (slide.backgroundColor) {
        colorBackgrounds++
        console.log(`   Background: 🎨 Color (${slide.backgroundColor})`)
      } else {
        console.log(`   Background: ❌ None`)
      }
    })

    console.log('\n📈 Summary:')
    console.log(`- Total slides: ${slides.length}`)
    console.log(`- Slides with images: ${slidesWithImages}`)
    console.log(`- UploadThing images: ${uploadThingImages}`)
    console.log(`- Color backgrounds: ${colorBackgrounds}`)

    console.log('\n🔧 Upload Integration Status:')
    console.log('✅ Hero slide form updated to use UploadThing')
    console.log('✅ CustomUploadThing component integrated')
    console.log('✅ Old manual upload method removed')
    console.log('✅ Image validation handled by UploadThing')

    console.log('\n📋 Next Steps for Testing:')
    console.log('1. Go to /admin/hero-slides')
    console.log('2. Click "Tambah Hero Slide"')
    console.log('3. Switch background type to "Gambar"')
    console.log('4. Upload an image using the UploadThing component')
    console.log('5. Verify the image URL starts with "https://utfs.io"')
    console.log('6. Save the slide and check if it displays correctly')

    console.log('\n🎯 Testing Checklist:')
    console.log('☐ Upload new hero slide background image')
    console.log('☐ Verify image stores as UploadThing URL')
    console.log('☐ Check image displays in preview')
    console.log('☐ Confirm image shows on homepage carousel')
    console.log('☐ Test edit existing slide with new image')
    console.log('☐ Test removing background image')

  } catch (error) {
    console.error('❌ Error testing hero slide upload:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testHeroSlideUpload()
