'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import { HeroSlideForm } from '@/components/admin/hero-slide-form'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'
import { useToast } from '@/hooks/use-toast'

interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string
  backgroundImage: string | null
  backgroundColor: string | null
  textColor: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText: string | null
  secondaryButtonLink: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/admin/hero-slides')
      if (response.ok) {
        const data = await response.json()
        setSlides(data)
      }
    } catch (error) {
      console.error('Error fetching hero slides:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengambil data hero slides',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus slide ini?')) return

    try {
      const response = await fetch(`/api/admin/hero-slides/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Hero slide berhasil dihapus'
        })
        fetchSlides()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus hero slide',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const slide = slides.find(s => s.id === id)
      if (!slide) return

      const response = await fetch(`/api/admin/hero-slides/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...slide,
          isActive: !isActive
        })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Hero slide ${!isActive ? 'diaktifkan' : 'dinonaktifkan'}`
        })
        fetchSlides()
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengupdate status slide',
        variant: 'destructive'
      })
    }
  }

  const handleMoveSlide = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= slides.length) return

    try {
      const slide1 = slides[currentIndex]
      const slide2 = slides[newIndex]

      // Swap orders
      await Promise.all([
        fetch(`/api/admin/hero-slides/${slide1.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...slide1, order: slide2.order })
        }),
        fetch(`/api/admin/hero-slides/${slide2.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...slide2, order: slide1.order })
        })
      ])

      toast({
        title: 'Berhasil',
        description: 'Urutan slide berhasil diubah'
      })
      fetchSlides()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah urutan slide',
        variant: 'destructive'
      })
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingSlide(null)
    fetchSlides()
  }

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        <AdminBreadcrumb 
          items={[
            { label: 'Kelola Hero Slides' }
          ]} 
        />
        
        <div className="flex items-center justify-between mb-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
          <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <AdminBreadcrumb 
        items={[
          { label: 'Kelola Hero Slides' }
        ]} 
      />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kelola Hero Slides</h1>
          <p className="text-xs text-muted-foreground">Kelola tampilan carousel di halaman utama</p>
        </div>
        <Button
          onClick={() => {
            setEditingSlide(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Hero Slide
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {editingSlide ? 'Edit Hero Slide' : 'Tambah Hero Slide Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <HeroSlideForm
              slide={editingSlide}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false)
                setEditingSlide(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {slide.title}
                    </h3>
                    <Badge variant={slide.isActive ? "default" : "secondary"} className="text-xs">
                      {slide.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Urutan: {slide.order}
                    </span>
                  </div>
                  
                  {slide.subtitle && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {slide.subtitle}
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {slide.description}
                  </p>
                  
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {slide.primaryButtonText} → {slide.primaryButtonLink}
                    </span>
                    {slide.secondaryButtonText && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {slide.secondaryButtonText} → {slide.secondaryButtonLink}
                      </span>
                    )}
                  </div>

                  {slide.backgroundColor && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">Background:</span>
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: slide.backgroundColor }}
                      />
                      <span className="text-xs">{slide.backgroundColor}</span>
                    </div>
                  )}

                  {slide.backgroundImage && (
                    <div className="mb-1">
                      <span className="text-xs text-muted-foreground">Background Image:</span>
                      <img
                        src={slide.backgroundImage}
                        alt="Background"
                        className="w-16 h-10 object-cover rounded mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 ml-4">
                  {/* Order controls */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveSlide(slide.id, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveSlide(slide.id, 'down')}
                      disabled={index === slides.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(slide.id, slide.isActive)}
                      className="h-7 w-7 p-0"
                    >
                      {slide.isActive ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSlide(slide)
                        setShowForm(true)
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(slide.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slides.length === 0 && (
        <Card className="text-center py-8 bg-card border-2 border-dashed border-muted">
          <CardContent className="p-3">
            <p className="text-muted-foreground mb-3">Belum ada hero slide</p>
            <Button
              onClick={() => {
                setEditingSlide(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Hero Slide Pertama
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
