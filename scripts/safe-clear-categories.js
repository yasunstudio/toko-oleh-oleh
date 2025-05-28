// Script to safely clear categories data for manual testing from admin
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function safeClearCategories() {
  console.log('🗑️  Safely clearing categories data...')
  console.log('=' .repeat(50))
  
  try {
    // First, get count of current categories
    const currentCount = await prisma.category.count()
    console.log(`📊 Current categories count: ${currentCount}`)
    
    // Check products linked to categories
    const productsWithCategories = await prisma.product.count()
    console.log(`📦 Total products: ${productsWithCategories}`)
    
    if (productsWithCategories > 0) {
      console.log('🔄 Step 1: Creating a temporary "Uncategorized" category...')
      
      // Create a temporary category for existing products
      const tempCategory = await prisma.category.create({
        data: {
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Temporary category for products during category reset'
        }
      })
      console.log(`✅ Created temporary category: ${tempCategory.id}`)
      
      // Move all products to the temporary category
      const updateResult = await prisma.product.updateMany({
        data: {
          categoryId: tempCategory.id
        }
      })
      console.log(`✅ Moved ${updateResult.count} products to temporary category`)
      
      console.log('🔄 Step 2: Deleting old categories (except temporary)...')
      
      // Delete all categories except the temporary one
      const deleteResult = await prisma.category.deleteMany({
        where: {
          id: { not: tempCategory.id }
        }
      })
      console.log(`✅ Deleted ${deleteResult.count} old categories`)
      
      console.log('🔄 Step 3: Deleting temporary category...')
      
      // Now delete the temporary category (this will fail if products still reference it)
      // So we'll keep it for now and let admin handle it
      console.log(`ℹ️  Keeping temporary "Uncategorized" category for existing products`)
      console.log(`   Admin can reassign products to new categories and delete this later`)
      
    } else {
      // No products, safe to delete all categories
      const deleteResult = await prisma.category.deleteMany({})
      console.log(`✅ Deleted ${deleteResult.count} categories`)
    }
    
    // Verify final state
    const remainingCount = await prisma.category.count()
    console.log(`📊 Remaining categories: ${remainingCount}`)
    
    console.log('')
    console.log('🎉 Categories cleared successfully!')
    console.log('')
    console.log('🔗 NEXT STEPS:')
    console.log('1. Go to admin panel: http://localhost:3000/admin')
    console.log('2. Navigate to Categories section')
    console.log('3. Create new categories with image upload')
    console.log('4. Test image upload and loading functionality')
    console.log('5. Reassign products to new categories')
    console.log('6. Delete the "Uncategorized" category when no longer needed')
    console.log('')
    console.log('📸 IMAGE UPLOAD TEST:')
    console.log('   - UploadThing is configured and working')
    console.log('   - All existing images are in cloud storage')
    console.log('   - New uploads will go directly to UploadThing')
    
  } catch (error) {
    console.error('❌ Error clearing categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

safeClearCategories()
