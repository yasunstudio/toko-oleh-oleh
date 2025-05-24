'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true)
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password
      })
      
      console.log('Sign in result:', result)
      
      if (result?.error) {
        toast({
          title: 'Login gagal',
          description: 'Email atau password salah',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Login berhasil',
          description: 'Redirecting to admin dashboard...'
        })
        router.push('/admin')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Login error',
        description: 'Terjadi kesalahan saat login',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login Admin</CardTitle>
          <CardDescription>Masuk ke dashboard admin</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tokooleholeh.com"
                {...register('email', { required: 'Email wajib diisi' })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message as string}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password wajib diisi' })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message as string}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              <p>Admin credentials: admin@tokooleholeh.com / admin123</p>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            Kembali ke halaman utama
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
