import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // Protect user-specific routes
        if (req.nextUrl.pathname.startsWith('/orders') || 
            req.nextUrl.pathname.startsWith('/cart') ||
            req.nextUrl.pathname.startsWith('/checkout')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/orders/:path*',
    '/cart/:path*',
    '/checkout/:path*'
  ]
}