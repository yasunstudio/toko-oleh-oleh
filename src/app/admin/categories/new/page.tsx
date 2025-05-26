import { CategoryForm } from '@/components/admin/category-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewCategoryPage() {
  return (
    <div className="p-6">
      <Card className="mb-8 bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">
            Tambah Kategori Baru
          </CardTitle>
          <p className="text-muted-foreground">
            Buat kategori baru untuk produk
          </p>
        </CardHeader>
      </Card>
      <Card className="bg-card">
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  )
}