// Script to clear categories data for manual testing from admin
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearCategories() {
  console.log('🗑️  Clearing categories data...')
  console.log('=' .repeat(50))
  
  try {
    // First, get count of current categories
    const currentCount = await prisma.category.count()
    console.log(`📊 Current categories count: ${currentCount}`)
    
    // Check if there are products linked to categories
    const productsWithCategories = await prisma.product.count()
    console.log(`📦 Products linked to categories: ${productsWithCategories}`)
    
    if (productsWithCategories > 0) {
      console.log('⚠️  WARNING: There are products linked to categories!')
      console.log('   Products will need to be updated after clearing categories.')
      console.log('   Proceeding anyway...')
    }
    
    // Delete all categories
    const deleteResult = await prisma.category.deleteMany({})
    console.log(`✅ Deleted ${deleteResult.count} categories`)
    
    // Verify deletion
    const remainingCount = await prisma.category.count()
    console.log(`📊 Remaining categories: ${remainingCount}`)
    
    if (remainingCount === 0) {
      console.log('🎉 Categories successfully cleared!')
      console.log('')
      console.log('🔗 NEXT STEPS:')
      console.log('1. Go to admin panel: http://localhost:3000/admin')
      console.log('2. Navigate to Categories section')
      console.log('3. Create new categories with image upload')
      console.log('4. Test image upload and loading functionality')
      console.log('')
      console.log('📝 NOTE: Products may need category reassignment after creating new categories')
    } else {
      console.log('❌ Some categories still remain. Please check for foreign key constraints.')
    }
    
  } catch (error) {
    console.error('❌ Error clearing categories:', error)
    
    if (error.code === 'P2003') {
      console.log('')
      console.log('💡 FOREIGN KEY CONSTRAINT ERROR:')
      console.log('   Some products are still linked to categories.')
      console.log('   Options:')
      console.log('   1. Set product categoryId to null first')
      console.log('   2. Delete products first')
      console.log('   3. Use CASCADE delete (if configured)')
    }
  } finally {
    await prisma.$disconnect()
  }
}

clearCategories()
