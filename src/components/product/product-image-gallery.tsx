'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductImage } from '@/types'

interface ProductImageGalleryProps {
  images: string[] | ProductImage[]
  alt: string
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Helper function to get image URL
  const getImageUrl = (image: string | ProductImage): string => {
    if (typeof image === 'string') return image
    return image.url
  }

  // Early return if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border">
        <span className="text-muted-foreground">No Image</span>
      </div>
    )
  }

  // Convert images to string array for easier handling
  const imageUrls = images.map(getImageUrl).filter(url => url && url !== '/placeholder.jpg');

  // Fallback if all images were placeholders or invalid
  if (imageUrls.length === 0) {
     const placeholderUrl = '/placeholder.jpg'; // Default placeholder
     // Attempt to use the first original image if it exists, even if it was filtered out (e.g. was a placeholder itself)
     const firstOriginalImage = images[0] ? getImageUrl(images[0]) : placeholderUrl;
     imageUrls.push(firstOriginalImage || placeholderUrl); 
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
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted border border-border">
        <Image
          src={imageUrls[currentIndex] || '/placeholder.jpg'} // Added fallback for safety
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          className="object-cover"
          priority
        />
        
        {imageUrls.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100 h-8 w-8 sm:h-10 sm:w-10 bg-background/50 hover:bg-background/80 text-foreground"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100 h-8 w-8 sm:h-10 sm:w-10 bg-background/50 hover:bg-background/80 text-foreground"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {imageUrls.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {imageUrls.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                index === currentIndex 
                  ? 'border-primary scale-105' 
                  : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              <Image
                src={imageUrl || '/placeholder.jpg'} // Added fallback for safety
                alt={`${alt} ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}