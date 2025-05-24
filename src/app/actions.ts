'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function testAuthAction() {
  const session = await getServerSession(authOptions)
  
  return {
    authenticated: !!session,
    isAdmin: session?.user?.role === 'ADMIN'
  }
}

export async function createProductAction(data: any) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return {
      success: false,
      error: 'Not authenticated'
    }
  }
  
  if (session.user.role !== 'ADMIN') {
    return {
      success: false,
      error: 'Not authorized - admin role required'
    }
  }
  
  try {
    // Process the product data
    
    const { name, description, price, stock, categoryId, images, weight, isActive } = data;
    
    // Validate required fields
    if (!name || price === undefined || !categoryId) {
      return {
        success: false,
        error: 'Name, price, and category are required',
        date: new Date().toISOString(),
        providedData: { name, price, categoryId }
      }
    }

    // Validate images
    if (!images) {
      return {
        success: false,
        error: 'Product images are required',
        date: new Date().toISOString()
      }
    }
    
    if (!Array.isArray(images)) {
      return {
        success: false,
        error: 'Images should be provided as an array',
        date: new Date().toISOString(),
        imagesType: typeof images,
        imagesValue: images
      }
    }
    
    if (images.length === 0) {
      return {
        success: false,
        error: 'At least one product image is required',
        date: new Date().toISOString()
      }
    }
    
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    
    // Import prisma client 
    const { prisma } = await import('@/lib/db')
    
    // Create the product first
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: typeof price === 'string' ? parseFloat(price) : Number(price),
        stock: typeof stock === 'string' ? parseInt(stock) : Number(stock) || 0,
        categoryId,
        weight: weight ? (typeof weight === 'string' ? parseFloat(weight) : Number(weight)) : null,
        slug,
        isActive: Boolean(isActive !== undefined ? isActive : true)
      }
    })
    
    // Then create the product images
    if (images && images.length > 0) {
      await Promise.all(
        images.map(async (url: string) => {
          await prisma.productImage.create({
            data: {
              url,
              productId: product.id
            }
          })
        })
      )
    }
    
    // Fetch the complete product with images and category
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true
      }
    })
    
    // Revalidate the products page
    revalidatePath('/admin/products')
    
    return {
      success: true,
      message: 'Produk berhasil dibuat',
      product: completeProduct,
      date: new Date().toISOString()
    }
  } catch (error) {
    console.error('Product creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace',
      date: new Date().toISOString()
    }
  }
}
