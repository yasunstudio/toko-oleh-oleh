/**
 * Cookie Configuration for Privacy Compliance
 * 
 * This configuration helps ensure your application is ready for:
 * - Chrome's third-party cookie deprecation
 * - Privacy Sandbox requirements
 * - GDPR/CCPA compliance
 */

export interface CookieConfig {
  name: string
  options: {
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    maxAge?: number
    path?: string
    domain?: string
    partitioned?: boolean
  }
}

// Cookie configurations for different purposes
export const cookieConfigs = {
  // Essential cookies (always allowed)
  session: {
    name: 'toko-session',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    },
  },
  
  // Cart persistence (essential for e-commerce)
  cart: {
    name: 'toko-cart',
    options: {
      httpOnly: false, // Needs to be accessible by client-side JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    },
  },
  
  // User preferences (theme, language, etc.)
  preferences: {
    name: 'toko-preferences',
    options: {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    },
  },
  
  // Theme preference (dark/light mode)
  theme: {
    name: 'theme',
    options: {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    },
  },
  
  // Analytics/tracking (requires user consent)
  analytics: {
    name: 'toko-analytics',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      // Use partitioned cookies for cross-site tracking if needed
      partitioned: process.env.NODE_ENV === 'production',
    },
  },
} as const

// Cookie categories for consent management
export const cookieCategories = {
  essential: {
    title: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off.',
    cookies: ['session', 'cart'],
    required: true,
  },
  functional: {
    title: 'Functional Cookies',
    description: 'These cookies enable the website to provide enhanced functionality and personalization.',
    cookies: ['preferences', 'theme'],
    required: false,
  },
  analytics: {
    title: 'Analytics Cookies',
    description: 'These cookies allow us to count visits and traffic sources to measure and improve performance.',
    cookies: ['analytics'],
    required: false,
  },
} as const

// Helper function to set cookies with proper configuration
export function setCookie(
  response: Response, 
  type: keyof typeof cookieConfigs, 
  value: string,
  overrides?: Partial<CookieConfig['options']>
) {
  const config = cookieConfigs[type]
  const options = { ...config.options, ...overrides }
  
  // Build cookie string
  let cookieString = `${config.name}=${value}`
  
  if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`
  if (options.path) cookieString += `; Path=${options.path}`
  if (options.domain) cookieString += `; Domain=${options.domain}`
  if (options.secure) cookieString += `; Secure`
  if (options.httpOnly) cookieString += `; HttpOnly`
  if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`
  if (options.partitioned) cookieString += `; Partitioned`
  
  response.headers.append('Set-Cookie', cookieString)
}

// Helper function to check if cookies are compliant with Privacy Sandbox
export function isPrivacySandboxCompliant(cookieConfig: CookieConfig): boolean {
  const { options } = cookieConfig
  
  // Check for Privacy Sandbox compliance
  return (
    // Must use Secure in production
    (process.env.NODE_ENV !== 'production' || options.secure === true) &&
    // SameSite should be Lax or Strict for cross-site protection
    (options.sameSite === 'lax' || options.sameSite === 'strict') &&
    // HttpOnly recommended for sensitive cookies
    (options.httpOnly !== false)
  )
}

// Get consent status from user preferences or local storage
export function getCookieConsent(): Record<string, boolean> {
  if (typeof window === 'undefined') {
    return { essential: true, functional: false, analytics: false }
  }
  
  try {
    const consent = localStorage.getItem('cookie-consent')
    return consent ? JSON.parse(consent) : { essential: true, functional: false, analytics: false }
  } catch {
    return { essential: true, functional: false, analytics: false }
  }
}

// Save consent preferences
export function setCookieConsent(consent: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    
    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }))
  } catch (error) {
    console.error('Failed to save cookie consent:', error)
  }
}
