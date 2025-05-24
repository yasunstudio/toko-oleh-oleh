'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Shield, Key, AlertTriangle, Eye, EyeOff } from 'lucide-react'

interface SecuritySettingsData {
  maxLoginAttempts: number
  lockoutDuration: number
  sessionTimeout: number
  passwordMinLength: number
  requirePasswordNumbers: boolean
  requirePasswordSymbols: boolean
  requirePasswordUppercase: boolean
  enableTwoFactor: boolean
  allowedIpAddresses: string[]
  blockedIpAddresses: string[]
}

interface SecurityLog {
  id: string
  type: 'LOGIN_ATTEMPT' | 'FAILED_LOGIN' | 'PASSWORD_CHANGE' | 'ADMIN_ACCESS'
  userId?: string
  userEmail?: string
  ipAddress: string
  userAgent: string
  timestamp: string
  success: boolean
}

export function SecuritySettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<SecuritySettingsData | null>(null)
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey] = useState('sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<SecuritySettingsData>()

  useEffect(() => {
    fetchSettings()
    fetchSecurityLogs()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/security')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        reset(data)
      }
    } catch (error) {
      console.error('Error fetching security settings:', error)
    }
  }

  const fetchSecurityLogs = async () => {
    try {
      const response = await fetch('/api/admin/security/logs')
      if (response.ok) {
        const data = await response.json()
        setSecurityLogs(data)
      }
    } catch (error) {
      console.error('Error fetching security logs:', error)
    }
  }

  const regenerateApiKey = async () => {
    try {
      const response = await fetch('/api/admin/security/regenerate-api-key', {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'API Key berhasil di-regenerate'
        })
      } else {
        toast({
          title: 'Gagal',
          description: 'Gagal regenerate API Key',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    }
  }

  const onSubmit = async (data: SecuritySettingsData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengaturan keamanan berhasil disimpan'
        })
        fetchSettings()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || 'Gagal menyimpan pengaturan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Authentication Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Keamanan Autentikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Login Attempts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxLoginAttempts">Maksimal Percobaan Login</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  {...register('maxLoginAttempts', { valueAsNumber: true })}
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Akun akan dikunci setelah {watch('maxLoginAttempts') || 5} percobaan gagal
                </p>
              </div>

              <div>
                <Label htmlFor="lockoutDuration">Durasi Lockout (menit)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  {...register('lockoutDuration', { valueAsNumber: true })}
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Akun akan terkunci selama {watch('lockoutDuration') || 30} menit
                </p>
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Timeout Sesi (menit)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  {...register('sessionTimeout', { valueAsNumber: true })}
                  placeholder="1440"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sesi akan berakhir setelah {watch('sessionTimeout') || 1440} menit tidak aktif
                </p>
              </div>
            </div>

            {/* Password Policy */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Kebijakan Password</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="passwordMinLength">Panjang Minimal Password</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    {...register('passwordMinLength', { valueAsNumber: true })}
                    placeholder="8"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requirePasswordNumbers">Wajib Mengandung Angka</Label>
                    <Switch
                      id="requirePasswordNumbers"
                      checked={watch('requirePasswordNumbers')}
                      onCheckedChange={(checked) => setValue('requirePasswordNumbers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requirePasswordSymbols">Wajib Mengandung Simbol</Label>
                    <Switch
                      id="requirePasswordSymbols"
                      checked={watch('requirePasswordSymbols')}
                      onCheckedChange={(checked) => setValue('requirePasswordSymbols', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requirePasswordUppercase">Wajib Huruf Besar</Label>
                    <Switch
                      id="requirePasswordUppercase"
                      checked={watch('requirePasswordUppercase')}
                      onCheckedChange={(checked) => setValue('requirePasswordUppercase', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Two Factor Authentication */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">
                    Aktifkan 2FA untuk lapisan keamanan tambahan
                  </p>
                </div>
                <Switch
                  id="enableTwoFactor"
                  checked={watch('enableTwoFactor')}
                  onCheckedChange={(checked) => setValue('enableTwoFactor', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* API Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Keamanan API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>API Key</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={regenerateApiKey}
              >
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gunakan API key ini untuk mengakses API eksternal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Log Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada log keamanan</p>
            ) : (
              securityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-medium">{log.userEmail || 'Unknown'}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      IP: {log.ipAddress} • {new Date(log.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Badge variant={log.success ? 'default' : 'destructive'}>
                    {log.success ? 'Berhasil' : 'Gagal'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}