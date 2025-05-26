import { prisma } from '@/lib/db';

// This script tests the product API functions directly using Prisma
// Run with: npx ts-node --project tsconfig.json src/scripts/test-product-api.ts

async function testProductImageHandling() {
  console.log('Testing product image handling...');
  
  try {
    // Find a category to use
    const category = await prisma.category.findFirst();
    if (!category) {
      console.error('No category found. Please create a category first.');
      return;
    }
    
    console.log('Using category:', category.name);
    
    // Create a product with images
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Product via Script',
        description: 'Created to test the image handling',
        price: 15000,
        stock: 50,
        slug: `test-product-${Date.now()}`,
        isActive: true,
        categoryId: category.id,
        images: {
          create: [
            { url: 'https://example.com/image1.jpg' },
            { url: 'https://example.com/image2.jpg' }
          ]
        }
      },
      include: {
        category: true,
        images: true
      }
    });
    
    console.log('Product created successfully:', {
      id: testProduct.id,
      name: testProduct.name,
      imageCount: testProduct.images.length
    });
    
    // Now update the product with new images
    console.log('Updating product with new images...');
    
    // First delete existing images
    await prisma.productImage.deleteMany({
      where: { productId: testProduct.id }
    });
    
    // Update the product with new images
    const updatedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: {
        name: 'Updated Test Product',
        images: {
          create: [
            { url: 'https://example.com/updated-image1.jpg' },
            { url: 'https://example.com/updated-image2.jpg' },
            { url: 'https://example.com/updated-image3.jpg' }
          ]
        }
      },
      include: {
        images: true
      }
    });
    
    console.log('Product updated successfully:', {
      id: updatedProduct.id,
      name: updatedProduct.name,
      imageCount: updatedProduct.images.length,
      images: updatedProduct.images.map(img => img.url)
    });
    
    // Clean up - delete the test product
    console.log('Cleaning up - deleting test product...');
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProductImageHandling();
