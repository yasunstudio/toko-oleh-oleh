import { CategoryForm } from '@/components/admin/category-form'

export default function NewCategoryPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tambah Kategori Baru</h1>
        <p className="text-gray-600">Buat kategori baru untuk produk</p>
      </div>

      <CategoryForm />
    </div>
  )
}