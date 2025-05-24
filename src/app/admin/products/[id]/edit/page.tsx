'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Product } from '@/types'

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-gray-600">Produk yang Anda cari tidak tersedia.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Produk</h1>
        <p className="text-gray-600">Perbarui informasi produk {product.name}</p>
      </div>

      <ProductForm product={product} isEdit />
    </div>
  )
}

// 'use client'

// import { use, useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { ProductForm } from '@/components/admin/product-form'

// export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params)
//   const [product, setProduct] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const router = useRouter()

//   useEffect(() => {
//     async function fetchProduct() {
//       setLoading(true)
//       setError(null)
//       try {
//         const res = await fetch(`/api/admin/products/${id}`)
//         if (!res.ok) {
//           if (res.status === 404) {
//             setError('Produk tidak ditemukan')
//           } else {
//             setError('Gagal mengambil data produk')
//           }
//           setProduct(null)
//         } else {
//           const data = await res.json()
//           setProduct(data)
//         }
//       } catch (err) {
//         setError('Gagal mengambil data produk')
//         setProduct(null)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchProduct()
//   }, [id])

//   if (loading) return <div className="text-center py-8">Loading...</div>
//   if (error) return <div className="text-center py-8 text-red-500">{error}</div>
//   if (!product) return null

//   return (
//     // <div className="max-w-2xl mx-auto py-8">
//     <div className='p-6'>
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold mb-4">Edit Produk</h1>
//         <ProductForm product={product} isEdit />
//       </div>  
//     </div>
//   )
// }
