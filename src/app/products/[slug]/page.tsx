import { Metadata } from 'next';
import { ProductDetail } from '@/components/product/product-detail';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await fetch(`${BASE_URL}/api/products/${slug}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      next: {
        revalidate: 60, // Revalidate every 60 seconds
      },
    });

    if (response.ok) {
      const product = await response.json();
      return {
        title: `${product.name} - Toko Oleh-Oleh`,
        description: product.description || `Beli ${product.name} berkualitas tinggi dengan harga terbaik. Produk asli dan terpercaya.`,
        keywords: [
          product.name,
          product.category?.name,
          'oleh-oleh',
          'makanan tradisional',
          'Indonesia',
        ].filter(Boolean),
        openGraph: {
          title: product.name,
          description: product.description,
          images:
            product.images?.length > 0
              ? [
                  {
                    url: typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                  },
                ]
              : [],
          type: 'website',
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Produk - Toko Oleh-Oleh',
    description: 'Temukan berbagai produk oleh-oleh tradisional Indonesia berkualitas tinggi.',
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) {
    throw new Error('Slug is required');
  }

  try {
    await fetch(`${BASE_URL}/api/products/${slug}`, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error('Error pre-fetching product data:', error);
    // We don't need to handle the error here as the ProductDetail component
    // will handle its own data fetching and error states
  }

  return <ProductDetail slug={slug} />;
}