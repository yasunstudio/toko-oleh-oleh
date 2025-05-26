"use client"

import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useCookieConsent } from '@/components/ui/cookie-consent-banner'

export function useThemeWithConsent() {
  const { theme, setTheme } = useTheme()
  const { consent } = useCookieConsent()

  useEffect(() => {
    // Only persist theme preference if functional cookies are allowed
    if (!consent.functional) {
      // If functional cookies are not allowed, use system theme
      setTheme('system')
    }
  }, [consent.functional, setTheme])

  const setThemeWithConsent = (newTheme: string) => {
    if (consent.functional) {
      setTheme(newTheme)
    } else {
      // If functional cookies not allowed, still change theme but don't persist
      setTheme(newTheme)
    }
  }

  return {
    theme,
    setTheme: setThemeWithConsent,
    canPersist: consent.functional
  }
}
