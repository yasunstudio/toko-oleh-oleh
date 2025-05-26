'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Expand, X, Move, Maximize2, Minimize2 } from 'lucide-react'
import { ProductImage } from '@/types'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface ProductImageGalleryProps {
  images: string[] | ProductImage[]
  alt: string
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover')

  // Toggle between cover and contain modes
  const toggleFitMode = () => {
    setFitMode(prev => prev === 'cover' ? 'contain' : 'cover')
  }

  // Helper function to get image URL
  const getImageUrl = (image: string | ProductImage): string => {
    if (typeof image === 'string') return image
    return image.url
  }

  // Early return if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center border border-border">
        <span className="text-muted-foreground">No Image</span>
      </div>
    )
  }

  // Convert images to string array for easier handling
  const imageUrls = images.map(getImageUrl).filter(url => url && url !== '/placeholder.jpg')

  // Fallback if all images were placeholders or invalid
  if (imageUrls.length === 0) {
    const placeholderUrl = '/placeholder.jpg'
    const firstOriginalImage = images[0] ? getImageUrl(images[0]) : placeholderUrl
    imageUrls.push(firstOriginalImage || placeholderUrl)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden border border-border group">
        <Image
          src={imageUrls[currentIndex]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
          className="transition-all duration-500 ease-in-out group-hover:scale-110"
          style={{
            objectFit: fitMode,
            width: '100%',
            height: '100%',
            padding: '0px',
          }}
        />
        
        {/* Fit Mode Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFitMode}
          className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm border-border/60 shadow-md hover:bg-background/90 hover:scale-110"
          title={fitMode === 'cover' ? 'Tampilkan seluruh gambar' : 'Perbesar gambar'}
        >
          {fitMode === 'cover' ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        
        {/* Zoom Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm border-border/60 shadow-md hover:bg-background/90 hover:scale-110"
            >
              <Expand className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl w-full h-[85vh] p-0 border-0 bg-black/90">
            <DialogTitle className="sr-only">{`${alt} - Image ${currentIndex + 1}`}</DialogTitle>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={imageUrls[currentIndex]}
                alt={alt}
                fill
                sizes="95vw"
                className={`p-${fitMode === 'contain' ? '4' : '0'}`}
                quality={95}
                style={{
                  objectFit: fitMode,
                  width: '100%',
                  height: '100%',
                }}
              />
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm z-50 hover:bg-background"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
              
              {imageUrls.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm z-50 hover:bg-background/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm z-50 hover:bg-background/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Navigation Arrows */}
        {imageUrls.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:bg-background/90 hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:bg-background/90 hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Overlay effect on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* Thumbnail Navigation */}
      {imageUrls.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2 hide-scrollbar justify-center">
          {imageUrls.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                index === currentIndex 
                  ? 'border-primary scale-105 shadow-lg' 
                  : 'border-border hover:border-muted-foreground/50 hover:scale-105'
              }`}
            >
              <Image
                src={imageUrl}
                alt={`${alt} - ${index + 1}`}
                fill
                sizes="64px"
                className="transition-all duration-300 hover:scale-110 hover:opacity-95"
                style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                  padding: '1px',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}