# Hero Carousel System Documentation

## Overview
Sistem Hero Carousel adalah implementasi carousel dinamis yang dikelola dari database untuk halaman utama toko online. Sistem ini memungkinkan admin untuk mengelola konten hero section melalui interface administrasi.

## Features Implemented

### 🎡 Core Carousel Features
- **Auto-play** dengan interval 5 detik
- **Manual navigation** dengan arrow buttons
- **Slide indicators** dengan progress bar
- **Smooth transitions** dengan fade effects
- **Responsive design** untuk mobile dan desktop
- **Touch/swipe support** (built-in browser behavior)

### 🎨 Design & Styling
- **Background options**: Color gradients atau custom images
- **Custom text colors** untuk optimal readability
- **Animated elements** dengan CSS keyframes
- **Overlay support** untuk background images
- **Modern UI** dengan Tailwind CSS

### 🗄️ Database Integration
- **Dynamic content** dari PostgreSQL database
- **Real-time updates** tanpa rebuild aplikasi
- **Order management** untuk urutan slide
- **Active/inactive status** untuk kontrol visibility
- **Structured data** dengan Prisma ORM

### ⚙️ Admin Management
- **CRUD operations** untuk hero slides
- **Form validation** dengan Zod schema
- **Image upload** support
- **Live preview** dalam form
- **Bulk operations** (activate/deactivate)

## Technical Architecture

### Database Schema
```prisma
model HeroSlide {
  id                   String   @id @default(cuid())
  title               String
  subtitle            String?
  description         String
  backgroundImage     String?
  backgroundColor     String?
  textColor          String   @default("#ffffff")
  primaryButtonText   String
  primaryButtonLink   String
  secondaryButtonText String?
  secondaryButtonLink String?
  order              Int      @default(1)
  isActive           Boolean  @default(true)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@map("hero_slides")
}
```

### API Endpoints

#### Public API
- `GET /api/hero-slides` - Fetch active slides for carousel

#### Admin API
- `GET /api/admin/hero-slides` - Fetch all slides (admin only)
- `POST /api/admin/hero-slides` - Create new slide
- `GET /api/admin/hero-slides/[id]` - Get specific slide
- `PUT /api/admin/hero-slides/[id]` - Update slide
- `DELETE /api/admin/hero-slides/[id]` - Delete slide

### Components Structure
```
src/components/
├── sections/
│   ├── hero-carousel.tsx      # Main carousel component
│   └── hero-section.tsx       # Original static component (backup)
└── admin/
    └── hero-slide-form.tsx    # Admin form component
```

### File Structure
```
src/app/
├── api/
│   ├── hero-slides/route.ts           # Public API
│   └── admin/hero-slides/
│       ├── route.ts                   # Admin CRUD API
│       └── [id]/route.ts             # Individual slide API
└── admin/hero-slides/page.tsx         # Admin management page

prisma/
├── seed-hero-slides.ts                # Seed data script
└── migrations/
    └── 20250525160439_add_hero_slides/ # Database migration
```

## Data Flow

1. **Frontend Request**: HeroCarousel component calls `/api/hero-slides`
2. **API Processing**: Route handler queries active slides from database
3. **Data Response**: JSON array of slide objects returned
4. **Client Rendering**: React component renders carousel with received data
5. **User Interaction**: Navigation controls modify current slide state
6. **Auto-play**: setInterval automatically advances slides

## Usage

### Basic Implementation
```tsx
import { HeroCarousel } from '@/components/sections/hero-carousel'

export default function HomePage() {
  return (
    <main>
      <HeroCarousel />
      {/* Other components */}
    </main>
  )
}
```

### Admin Management
1. Navigate to `/admin/hero-slides`
2. Click "Tambah Hero Slide" to create new slide
3. Fill form with content and styling options
4. Use live preview to verify appearance
5. Save and activate slide

### Data Seeding
```bash
# Seed initial hero slides
npm run seed-hero

# Full database reset with seeds
npm run db:reset
```

## Configuration Options

### Carousel Settings
- **Auto-play duration**: 5 seconds (configurable in component)
- **Transition duration**: 1 second fade
- **Fallback content**: Default slide when no data available

### Styling Options
- **Background**: Color gradients atau image URLs
- **Text color**: Hex color codes dengan color picker
- **Button styles**: Primary dan secondary button options
- **Responsive breakpoints**: Mobile-first design

## Performance Considerations

### Optimizations Implemented
- **Lazy loading**: Only active slide images are prioritized
- **Smooth transitions**: CSS transitions over JavaScript animations
- **Minimal re-renders**: React state optimizations
- **Error boundaries**: Graceful fallback for API failures

### Database Queries
- **Efficient filtering**: Only active slides queried on frontend
- **Ordered results**: Database-level ordering by `order` field
- **Indexed fields**: Primary keys and status fields optimized

## Security Features

### Authentication
- **Admin-only access**: Hero slide management requires admin role
- **Session validation**: Next-auth integration
- **CSRF protection**: Built-in Next.js protections

### Data Validation
- **Input sanitization**: Zod schema validation
- **File upload limits**: 5MB max image size
- **URL validation**: Link field validation

## Monitoring & Analytics

### Error Handling
- **API error responses**: Structured error messages
- **Client-side fallbacks**: Default content when API fails
- **Console logging**: Development debugging support

### Performance Tracking
- **Load times**: Carousel render performance
- **User interactions**: Navigation click tracking
- **Error rates**: API failure monitoring

## Future Enhancements

### Planned Features
- [ ] **Advanced animations**: Custom transition effects
- [ ] **A/B testing**: Multiple carousel variants
- [ ] **Analytics integration**: Click-through rate tracking
- [ ] **Scheduling**: Time-based slide activation
- [ ] **Localization**: Multi-language slide content

### Technical Improvements
- [ ] **CDN integration**: Image optimization service
- [ ] **Caching layer**: Redis for carousel data
- [ ] **Background processing**: Async image processing
- [ ] **Bulk import**: CSV/Excel slide import

## Testing

### Automated Tests
- **API endpoints**: Unit tests for all CRUD operations
- **Component rendering**: React Testing Library tests
- **Database operations**: Prisma integration tests

### Manual Testing
```bash
# Run comprehensive test suite
./scripts/test-hero-carousel.sh
```

### Test Coverage
- ✅ API functionality
- ✅ Component rendering
- ✅ Database integration
- ✅ Admin interface
- ✅ Responsive design

## Troubleshooting

### Common Issues
1. **Slides not showing**: Check database connection and seed data
2. **Admin access denied**: Verify user role and authentication
3. **Images not loading**: Check upload permissions and file paths
4. **Styling issues**: Verify Tailwind CSS compilation

### Debug Commands
```bash
# Check database data
npx prisma studio

# View API responses
curl http://localhost:3000/api/hero-slides

# Check application logs
npm run dev
```

## Deployment Notes

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Build Process
1. Database migration: `npx prisma migrate deploy`
2. Seed data: `npm run seed-hero`
3. Build application: `npm run build`
4. Start production: `npm start`

---

**Created**: May 25, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
