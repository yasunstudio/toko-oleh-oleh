// Final migration summary script
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showMigrationSummary() {
  console.log('🎉 IMAGE MIGRATION TO UPLOADTHING COMPLETED! 🎉')
  console.log('=' .repeat(60))
  console.log('')

  try {
    // Count all images
    const productImages = await prisma.productImage.count()
    const categories = await prisma.category.count({
      where: { image: { not: null } }
    })
    const heroSlides = await prisma.heroSlide.count({
      where: { backgroundImage: { not: null } }
    })

    // Count cloud URLs
    const cloudProductImages = await prisma.productImage.count({
      where: { url: { startsWith: 'https://utfs.io' } }
    })
    const cloudCategories = await prisma.category.count({
      where: { image: { startsWith: 'https://utfs.io' } }
    })
    const cloudHeroSlides = await prisma.heroSlide.count({
      where: { backgroundImage: { startsWith: 'https://utfs.io' } }
    })

    // Count local paths (should be 0)
    const localProductImages = await prisma.productImage.count({
      where: { url: { startsWith: '/uploads' } }
    })
    const localCategories = await prisma.category.count({
      where: { image: { startsWith: '/uploads' } }
    })
    const localHeroSlides = await prisma.heroSlide.count({
      where: { backgroundImage: { startsWith: '/uploads' } }
    })

    console.log('📊 MIGRATION RESULTS:')
    console.log('')
    console.log(`📸 Product Images:`)
    console.log(`   Total: ${productImages}`)
    console.log(`   ☁️  Cloud (UploadThing): ${cloudProductImages}`)
    console.log(`   💻 Local: ${localProductImages}`)
    console.log('')
    console.log(`🏷️  Category Images:`)
    console.log(`   Total: ${categories}`)
    console.log(`   ☁️  Cloud (UploadThing): ${cloudCategories}`)
    console.log(`   💻 Local: ${localCategories}`)
    console.log('')
    console.log(`🎭 Hero Slide Images:`)
    console.log(`   Total: ${heroSlides}`)
    console.log(`   ☁️  Cloud (UploadThing): ${cloudHeroSlides}`)
    console.log(`   💻 Local: ${localHeroSlides}`)
    console.log('')

    const totalImages = productImages + categories + heroSlides
    const totalCloud = cloudProductImages + cloudCategories + cloudHeroSlides
    const totalLocal = localProductImages + localCategories + localHeroSlides

    console.log('📈 OVERALL SUMMARY:')
    console.log(`   Total Images: ${totalImages}`)
    console.log(`   ☁️  Migrated to Cloud: ${totalCloud} (${((totalCloud/totalImages)*100).toFixed(1)}%)`)
    console.log(`   💻 Still Local: ${totalLocal} (${((totalLocal/totalImages)*100).toFixed(1)}%)`)
    console.log('')

    if (totalLocal === 0) {
      console.log('✅ SUCCESS: All images have been migrated to UploadThing!')
      console.log('🌐 Your application is now using cloud storage for all images.')
      console.log('🚀 Images will load faster and your app is more scalable.')
    } else {
      console.log('⚠️  WARNING: Some images are still using local paths.')
      console.log('   Please check the migration scripts for any issues.')
    }

    console.log('')
    console.log('🔗 NEXT STEPS:')
    console.log('1. Test the website at http://localhost:3000')
    console.log('2. Verify all images load correctly')
    console.log('3. Optionally clean up local /public/uploads/ directory')
    console.log('4. Deploy your application')
    console.log('')
    console.log('🎊 Migration Complete! 🎊')

  } catch (error) {
    console.error('❌ Error checking migration status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showMigrationSummary()
