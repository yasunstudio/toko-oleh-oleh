import { UserForm } from '@/components/admin/user-form'

export default function NewUserPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tambah Pengguna Baru</h1>
        <p className="text-gray-600">Buat akun pengguna baru untuk sistem</p>
      </div>

      <UserForm />
    </div>
  )
}