import { MainLayout } from '@/components/layout/main-layout'
import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { CategorySection } from '@/components/sections/category-section'
import { AboutSection } from '@/components/sections/about-section'

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedProducts />
      <CategorySection />
      <AboutSection />
    </MainLayout>
  )
}