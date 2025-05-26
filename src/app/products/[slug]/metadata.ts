import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${slug}`)
    
    if (response.ok) {
      const product = await response.json()
      return {
        title: `${product.name} - Toko Oleh-Oleh`,
        description: product.description || `Beli ${product.name} berkualitas tinggi dengan harga terbaik. Produk asli dan terpercaya.`,
        keywords: [product.name, product.category?.name, 'oleh-oleh', 'makanan tradisional', 'Indonesia'].filter(Boolean),
        openGraph: {
          title: product.name,
          description: product.description,
          images: product.images?.length > 0 ? [product.images[0]] : [],
          type: 'website',
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Produk - Toko Oleh-Oleh',
    description: 'Temukan berbagai produk oleh-oleh tradisional Indonesia berkualitas tinggi.',
  }
}
