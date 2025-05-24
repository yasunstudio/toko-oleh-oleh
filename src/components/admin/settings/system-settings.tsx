'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Server, 
  Database, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react'

interface SystemInfo {
  version: string
  environment: string
  nodeVersion: string
  platform: string
  uptime: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  diskUsage: {
    used: number
    total: number
    percentage: number
  }
  databaseStatus: 'connected' | 'disconnected'
  lastBackup?: string
}

export function SystemSettings() {
  const { toast } = useToast()
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [backupLoading, setBackupLoading] = useState(false)
  const [cacheLoading, setCacheLoading] = useState(false)

  useEffect(() => {
    fetchSystemInfo()
  }, [])

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/admin/system/info')
      if (response.ok) {
        const data = await response.json()
        setSystemInfo(data)
      }
    } catch (error) {
      console.error('Error fetching system info:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    setBackupLoading(true)
    try {
      const response = await fetch('/api/admin/system/backup', {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Backup database berhasil dibuat'
        })
        fetchSystemInfo()
      } else {
        toast({
          title: 'Gagal',
          description: 'Gagal membuat backup database',
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
      setBackupLoading(false)
    }
  }

  const clearCache = async () => {
    setCacheLoading(true)
    try {
      const response = await fetch('/api/admin/system/clear-cache', {
       method: 'POST'
     })

     if (response.ok) {
       toast({
         title: 'Berhasil',
         description: 'Cache berhasil dibersihkan'
       })
     } else {
       toast({
         title: 'Gagal',
         description: 'Gagal membersihkan cache',
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
     setCacheLoading(false)
   }
 }

 const formatBytes = (bytes: number) => {
   const sizes = ['Bytes', 'KB', 'MB', 'GB']
   if (bytes === 0) return '0 Byte'
   const i = Math.floor(Math.log(bytes) / Math.log(1024))
   return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
 }

 const formatUptime = (seconds: number) => {
   const days = Math.floor(seconds / (24 * 60 * 60))
   const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
   const minutes = Math.floor((seconds % (60 * 60)) / 60)
   return `${days}d ${hours}h ${minutes}m`
 }

 if (loading) {
   return <div>Loading system information...</div>
 }

 if (!systemInfo) {
   return <div>Error loading system information</div>
 }

 return (
   <div className="space-y-6">
     {/* System Overview */}
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center">
           <Server className="h-5 w-5 mr-2" />
           Informasi Sistem
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="space-y-2">
             <div className="flex items-center space-x-2">
               <Server className="h-4 w-4 text-gray-400" />
               <span className="text-sm font-medium">Versi Aplikasi</span>
             </div>
             <p className="text-lg font-bold">{systemInfo.version}</p>
           </div>

           <div className="space-y-2">
             <div className="flex items-center space-x-2">
               <Badge variant={systemInfo.environment === 'production' ? 'default' : 'secondary'}>
                 {systemInfo.environment}
               </Badge>
               <span className="text-sm font-medium">Environment</span>
             </div>
             <p className="text-sm text-gray-600">Node.js {systemInfo.nodeVersion}</p>
           </div>

           <div className="space-y-2">
             <div className="flex items-center space-x-2">
               <Cpu className="h-4 w-4 text-gray-400" />
               <span className="text-sm font-medium">Platform</span>
             </div>
             <p className="text-lg font-bold">{systemInfo.platform}</p>
           </div>

           <div className="space-y-2">
             <div className="flex items-center space-x-2">
               <RefreshCw className="h-4 w-4 text-gray-400" />
               <span className="text-sm font-medium">Uptime</span>
             </div>
             <p className="text-lg font-bold">{formatUptime(systemInfo.uptime)}</p>
           </div>
         </div>
       </CardContent>
     </Card>

     {/* Resource Usage */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       {/* Memory Usage */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center">
             <MemoryStick className="h-5 w-5 mr-2" />
             Penggunaan Memory
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div>
             <div className="flex justify-between text-sm mb-2">
               <span>Digunakan: {formatBytes(systemInfo.memoryUsage.used)}</span>
               <span>Total: {formatBytes(systemInfo.memoryUsage.total)}</span>
             </div>
             <Progress value={systemInfo.memoryUsage.percentage} className="h-2" />
             <p className="text-xs text-gray-500 mt-1">
               {systemInfo.memoryUsage.percentage.toFixed(1)}% digunakan
             </p>
           </div>
         </CardContent>
       </Card>

       {/* Disk Usage */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center">
             <HardDrive className="h-5 w-5 mr-2" />
             Penggunaan Disk
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div>
             <div className="flex justify-between text-sm mb-2">
               <span>Digunakan: {formatBytes(systemInfo.diskUsage.used)}</span>
               <span>Total: {formatBytes(systemInfo.diskUsage.total)}</span>
             </div>
             <Progress value={systemInfo.diskUsage.percentage} className="h-2" />
             <p className="text-xs text-gray-500 mt-1">
               {systemInfo.diskUsage.percentage.toFixed(1)}% digunakan
             </p>
           </div>
         </CardContent>
       </Card>
     </div>

     {/* Database Status */}
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center">
           <Database className="h-5 w-5 mr-2" />
           Status Database
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
             <Badge variant={systemInfo.databaseStatus === 'connected' ? 'default' : 'destructive'}>
               {systemInfo.databaseStatus === 'connected' ? 'Terhubung' : 'Terputus'}
             </Badge>
             <div>
               <p className="text-sm font-medium">MySQL Database</p>
               {systemInfo.lastBackup && (
                 <p className="text-xs text-gray-500">
                   Backup terakhir: {new Date(systemInfo.lastBackup).toLocaleString('id-ID')}
                 </p>
               )}
             </div>
           </div>
           <div className="flex space-x-2">
             <Button 
               variant="outline" 
               size="sm"
               onClick={createBackup}
               disabled={backupLoading}
             >
               <Download className="h-4 w-4 mr-2" />
               {backupLoading ? 'Creating...' : 'Backup DB'}
             </Button>
           </div>
         </div>
       </CardContent>
     </Card>

     {/* System Actions */}
     <Card>
       <CardHeader>
         <CardTitle>Aksi Sistem</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Button 
             variant="outline" 
             className="h-20 flex-col"
             onClick={clearCache}
             disabled={cacheLoading}
           >
             <Trash2 className="h-6 w-6 mb-2" />
             <span>{cacheLoading ? 'Membersihkan...' : 'Bersihkan Cache'}</span>
           </Button>

           <Button 
             variant="outline" 
             className="h-20 flex-col"
             onClick={fetchSystemInfo}
           >
             <RefreshCw className="h-6 w-6 mb-2" />
             <span>Refresh Info</span>
           </Button>

           <Button 
             variant="outline" 
             className="h-20 flex-col"
             onClick={createBackup}
             disabled={backupLoading}
           >
             <Download className="h-6 w-6 mb-2" />
             <span>{backupLoading ? 'Backup...' : 'Backup Manual'}</span>
           </Button>
         </div>
       </CardContent>
     </Card>

     {/* System Health Alerts */}
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center">
           <AlertTriangle className="h-5 w-5 mr-2" />
           Peringatan Sistem
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className="space-y-3">
           {systemInfo.memoryUsage.percentage > 80 && (
             <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
               <AlertTriangle className="h-4 w-4 text-red-600" />
               <span className="text-sm text-red-800">
                 Penggunaan memory tinggi ({systemInfo.memoryUsage.percentage.toFixed(1)}%)
               </span>
             </div>
           )}

           {systemInfo.diskUsage.percentage > 90 && (
             <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
               <AlertTriangle className="h-4 w-4 text-red-600" />
               <span className="text-sm text-red-800">
                 Penggunaan disk hampir penuh ({systemInfo.diskUsage.percentage.toFixed(1)}%)
               </span>
             </div>
           )}

           {systemInfo.databaseStatus === 'disconnected' && (
             <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
               <AlertTriangle className="h-4 w-4 text-red-600" />
               <span className="text-sm text-red-800">
                 Database tidak terhubung
               </span>
             </div>
           )}

           {systemInfo.memoryUsage.percentage <= 80 && 
            systemInfo.diskUsage.percentage <= 90 && 
            systemInfo.databaseStatus === 'connected' && (
             <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
               <Server className="h-4 w-4 text-green-600" />
               <span className="text-sm text-green-800">
                 Semua sistem berjalan normal
               </span>
             </div>
           )}
         </div>
       </CardContent>
     </Card>
   </div>
 )
}