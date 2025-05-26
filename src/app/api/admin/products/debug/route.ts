import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get debug information about products
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    
    // Get sample products
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // Get products with no images
    const productsWithoutImages = await prisma.product.count({
      where: {
        images: {
          none: {}
        }
      }
    });

    const productsOutOfStock = await prisma.product.count({
      where: {
        stock: {
          lte: 0
        }
      }
    });

    // Get inactive products
    const inactiveProducts = await prisma.product.count({
      where: {
        isActive: false
      }
    });

    return NextResponse.json({
      status: 'success',
      data: {
        counts: {
          products: productCount,
          categories: categoryCount,
          productsWithoutImages,
          productsOutOfStock,
          inactiveProducts
        },
        sampleProducts,
        issues: {
          productsWithoutImages: productsWithoutImages > 0,
          productsOutOfStock: productsOutOfStock > 0,
          inactiveProducts: inactiveProducts > 0
        }
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to get debug information'
      },
      { status: 500 }
    );
  }
}