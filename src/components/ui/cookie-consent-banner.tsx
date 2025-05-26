'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings, Cookie, Shield } from 'lucide-react'
import { cookieCategories, getCookieConsent, setCookieConsent } from '@/lib/cookie-config'

interface CookieConsentProps {
  onConsentChange?: (consent: Record<string, boolean>) => void
}

export function CookieConsentBanner({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<Record<string, boolean>>({
    essential: true,
    functional: false,
    analytics: false,
  })

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = getCookieConsent()
    const hasConsented = localStorage.getItem('cookie-consent-given')
    
    setConsent(savedConsent)
    
    if (!hasConsented) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allConsent = {
      essential: true,
      functional: true,
      analytics: true,
    }
    
    setConsent(allConsent)
    setCookieConsent(allConsent)
    localStorage.setItem('cookie-consent-given', 'true')
    setShowBanner(false)
    onConsentChange?.(allConsent)
  }

  const handleAcceptSelected = () => {
    setCookieConsent(consent)
    localStorage.setItem('cookie-consent-given', 'true')
    setShowBanner(false)
    setShowSettings(false)
    onConsentChange?.(consent)
  }

  const handleRejectAll = () => {
    const minimalConsent = {
      essential: true,
      functional: false,
      analytics: false,
    }
    
    setConsent(minimalConsent)
    setCookieConsent(minimalConsent)
    localStorage.setItem('cookie-consent-given', 'true')
    setShowBanner(false)
    onConsentChange?.(minimalConsent)
  }

  const updateConsent = (category: string, enabled: boolean) => {
    setConsent(prev => ({
      ...prev,
      [category]: enabled
    }))
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Cookie Preferences</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                Choose your preferences below or accept all to continue.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 border-border hover:bg-accent hover:text-accent-foreground">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                      <Shield className="h-5 w-5 text-primary" />
                      Cookie Settings
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Manage your cookie preferences. Essential cookies cannot be disabled.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {Object.entries(cookieCategories).map(([key, category]) => (
                      <Card key={key} className="border-border bg-background">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-foreground">{category.title}</CardTitle>
                            <Switch
                              checked={consent[key]}
                              onCheckedChange={(checked) => updateConsent(key, checked)}
                              disabled={category.required}
                              // className data-[state=checked]:bg-primary data-[state=unchecked]:bg-input thumb:bg-background" // Using default shadcn/ui switch styles
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                          {category.required && (
                            <p className="text-xs text-primary mt-1">Required</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAcceptSelected} className="flex-1">
                      Save Preferences
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={handleRejectAll} className="border-border hover:bg-accent hover:text-accent-foreground">
                Reject All
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook to use cookie consent in components
export function useCookieConsent() {
  const [consent, setInternalConsent] = useState<Record<string, boolean>>({
    essential: true,
    functional: false,
    analytics: false,
  })

  useEffect(() => {
    const savedConsent = getCookieConsent()
    setInternalConsent(savedConsent)

    const handleConsentChange = (event: CustomEvent) => {
      setInternalConsent(event.detail)
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    }
  }, [])

  return {
    consent,
    hasConsent: (category: string) => consent[category] === true,
    isEssential: (category: string) => category === 'essential',
  }
}
