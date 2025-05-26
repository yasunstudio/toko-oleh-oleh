'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch slides from database
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/hero-slides')
        if (response.ok) {
          const data = await response.json()
          setSlides(data)
        } else {
          console.error('Failed to fetch hero slides')
          // Fallback to default slide if API fails
          setSlides([{
            id: 'default',
            title: 'Oleh-Oleh Khas Daerah',
            subtitle: 'Berkualitas Tinggi',
            description: 'Temukan berbagai macam oleh-oleh khas dari seluruh Indonesia. Pesan online, kirim ke seluruh nusantara dengan kualitas terjamin.',
            backgroundImage: null,
            backgroundColor: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8))',
            textColor: '#ffffff',
            primaryButtonText: 'Lihat Produk',
            primaryButtonLink: '/products',
            secondaryButtonText: 'Jelajahi Kategori',
            secondaryButtonLink: '/categories',
            order: 1,
            isActive: true
          }])
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error)
        // Fallback slide
        setSlides([{
          id: 'default',
          title: 'Oleh-Oleh Khas Daerah',
          subtitle: 'Berkualitas Tinggi',
          description: 'Temukan berbagai macam oleh-oleh khas dari seluruh Indonesia. Pesan online, kirim ke seluruh nusantara dengan kualitas terjamin.',
          backgroundImage: null,
          backgroundColor: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8))',
          textColor: '#ffffff',
          primaryButtonText: 'Lihat Produk',
          primaryButtonLink: '/products',
          secondaryButtonText: 'Jelajahi Kategori',
          secondaryButtonLink: '/categories',
          order: 1,
          isActive: true
        }])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const nextSlide = () => {
    if (slides.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setIsAutoPlaying(false) // Stop auto-play when user interacts
    }
  }

  const prevSlide = () => {
    if (slides.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
      setIsAutoPlaying(false) // Stop auto-play when user interacts
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  // Helper function to get background style
  const getBackgroundStyle = (slide: HeroSlide) => {
    if (slide.backgroundImage) {
      return {
        backgroundImage: `url(${slide.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    
    // Handle CSS linear-gradient values
    if (slide.backgroundColor && slide.backgroundColor.startsWith('linear-gradient')) {
      return {
        background: slide.backgroundColor
      }
    }
    
    return {}
  }

  // Helper function to get background class
  const getBackgroundClass = (slide: HeroSlide) => {
    if (slide.backgroundImage) {
      return 'bg-black/50' // Overlay for better text readability
    }
    
    // If backgroundColor is a CSS gradient, don't use any background class
    if (slide.backgroundColor && slide.backgroundColor.startsWith('linear-gradient')) {
      return ''
    }
    
    // Fallback to Tailwind classes for backwards compatibility
    return slide.backgroundColor || 'bg-gradient-to-r from-primary to-primary/80'
  }

  if (isLoading) {
    return (
      <section className="relative overflow-hidden">
        <div 
          className="h-[300px] md:h-[400px] flex items-center justify-center"
          style={{ background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8))' }}
        >
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="h-[300px] md:h-[400px] bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-3xl font-bold mb-4">Toko Oleh-Oleh</h1>
            <p className="text-lg">Selamat datang di toko online kami</p>
          </div>
        </div>
      </section>
    )
  }

  const currentSlideData = slides[currentSlide]

  return (
    <section className="relative overflow-hidden">
      {/* Slides Container */}
      <div className="relative h-[300px] md:h-[400px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            } ${getBackgroundClass(slide)}`}
            style={getBackgroundStyle(slide)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="text-center w-full">
                <h1 
                  className="text-2xl md:text-4xl font-bold mb-3 animate-fade-in"
                  style={{ color: slide.textColor }}
                >
                  {slide.title}
                  {slide.subtitle && (
                    <span className="block text-yellow-300">{slide.subtitle}</span>
                  )}
                </h1>
                <p 
                  className="text-base md:text-lg mb-5 max-w-3xl mx-auto opacity-90 animate-fade-in-delay"
                  style={{ color: slide.textColor }}
                >
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-delay-2">
                  <Button size="default" asChild className="bg-background text-foreground hover:bg-muted">
                    <Link href={slide.primaryButtonLink}>
                      {slide.primaryButtonText}
                    </Link>
                  </Button>
                  {slide.secondaryButtonText && slide.secondaryButtonLink && (
                    <Button 
                      size="default" 
                      variant="outline" 
                      asChild 
                      className="border-2 border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300 hover:text-primary font-semibold"
                    >
                      <Link href={slide.secondaryButtonLink}>
                        {slide.secondaryButtonText}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-yellow-300 scale-125'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
            <div
              className="h-full bg-yellow-300 transition-all duration-200"
              style={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`
              }}
            />
          </div>
        </>
      )}
    </section>
  )
}
