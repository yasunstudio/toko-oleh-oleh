import { UserForm } from '@/components/admin/user-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewUserPage() {
  return (
    <div className="p-6">
      <Card className="mb-8 bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">
            Tambah Pengguna Baru
          </CardTitle>
          <p className="text-muted-foreground">
            Buat akun pengguna baru untuk sistem
          </p>
        </CardHeader>
      </Card>
      <Card className="bg-card">
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  )
}