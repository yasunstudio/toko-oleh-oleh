import { MainLayout } from '@/components/layout/main-layout'
import { HeroCarousel } from '@/components/sections/hero-carousel'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { CategorySection } from '@/components/sections/category-section'
import { AboutSection } from '@/components/sections/about-section'

export default function HomePage() {
  return (
    <MainLayout>
      <HeroCarousel />
      <FeaturedProducts />
      <CategorySection />
      <AboutSection />
    </MainLayout>
  )
}