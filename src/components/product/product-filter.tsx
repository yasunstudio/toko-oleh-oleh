'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Search, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

export function ProductFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  )
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '1000000')
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeCount=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','))
    }
    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
      params.set('minPrice', priceRange[0].toString())
      params.set('maxPrice', priceRange[1].toString())
    }
    
    // Preserve existing sort parameter
    const currentSort = new URLSearchParams(window.location.search).get('sort')
    if (currentSort) params.set('sort', currentSort)
    
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setPriceRange([0, 1000000])
    router.push('/products')
  }

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categorySlug])
    } else {
      setSelectedCategories(prev => prev.filter(slug => slug !== categorySlug))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || 
    priceRange[0] > 0 || priceRange[1] < 1000000

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="bg-card text-card-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Pencarian</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm bg-background border-border focus:border-primary"
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="bg-card text-card-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Kategori</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 w-full bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.slug}
                    checked={selectedCategories.includes(category.slug)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.slug, checked as boolean)
                    }
                    className="h-4 w-4 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label 
                    htmlFor={category.slug}
                    className="flex-1 text-xs cursor-pointer text-foreground leading-relaxed"
                  >
                    {category.name}
                    <span className="text-muted-foreground ml-1">
                      ({category._count?.products || 0})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card className="bg-card text-card-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Rentang Harga</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1000000}
              min={0}
              step={10000}
              className="w-full [&>span:first-child]:bg-primary"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </CardContent>
      </Card>

      {/* Apply/Clear Buttons */}
      <div className="space-y-2">
        <Button onClick={applyFilters} className="w-full h-9 text-sm">
          Terapkan Filter
        </Button>
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" className="w-full h-8 text-xs">
            <X className="h-3 w-3 mr-2" />
            Hapus Filter
          </Button>
        )}
      </div>
    </div>
  )
}