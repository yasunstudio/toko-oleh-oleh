'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCookieConsent } from '@/components/ui/cookie-consent-banner';
import { SessionManager, getRetryDelay, TRAFFIC_CONFIG } from '@/lib/traffic-config';

export function TrafficTracker() {
  const pathname = usePathname();
  const { consent } = useCookieConsent();
  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Session ID management functions
  const getSessionId = useCallback(() => SessionManager.get(), []);
  const setSessionId = useCallback((id: string) => SessionManager.set(id), []);

  // Capture page visit function with retry and better error handling
  const capturePageVisit = useCallback(async (retryCount = 0): Promise<any> => {
    try {
      startTimeRef.current = Date.now();
      const currentSessionId = getSessionId();
      sessionIdRef.current = currentSessionId;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (currentSessionId) {
        headers['X-Session-ID'] = currentSessionId;
      }
      
      const captureResponse = await fetch('/api/admin/reports/traffic/capture', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          url: pathname,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
          ipAddress: '127.0.0.1', // Server will get the real IP
          timestamp: new Date().toISOString(),
          consentGiven: true,
        }),
      });
      
      if (captureResponse.ok) {
        const captureData = await captureResponse.json();
        
        if (captureData.sessionId) {
          setSessionId(captureData.sessionId);
        }
        
        return captureData;
      } else {
        const errorData = await captureResponse.json();
        
        // If error is due to invalid session, clear it and retry once
        if (captureResponse.status === 400 && retryCount === 0) {
          SessionManager.clear();
          return await capturePageVisit(retryCount + 1);
        }
        
        throw new Error(errorData.message || 'Failed to capture visit');
      }
    } catch (error) {
      console.error('❌ Error in capturePageVisit:', error);
      
      // Only throw if this is the last retry
      if (retryCount >= 2) throw error;
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return await capturePageVisit(retryCount + 1);
    }
  }, [pathname, getSessionId, setSessionId]);

  // Update page title function
  const updatePageTitle = useCallback(async () => {
    try {
      const currentSessionId = sessionIdRef.current || getSessionId();
      
      if (!currentSessionId) {
        return;
      }
      
      const updateResponse = await fetch('/api/admin/reports/traffic/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: pathname,
          pageTitle: document.title,
          sessionId: currentSessionId,
        }),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('❌ Failed to update page title:', errorData);
      }
    } catch (error) {
      console.error('❌ Error updating page title:', error);
    }
  }, [pathname, getSessionId]);

  // Update page duration function with better error handling
  const updatePageDuration = useCallback(async () => {
    try {
      if (startTimeRef.current > 0) {
        const duration = Date.now() - startTimeRef.current;
        const currentSessionId = sessionIdRef.current || getSessionId();
        
        if (!currentSessionId) {
          return;
        }
        
        const durationResponse = await fetch('/api/admin/reports/traffic/duration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: pathname,
            duration: duration,
            sessionId: currentSessionId,
          }),
          keepalive: true, // Ensure request completes even if page is unloading
        });
        
        if (!durationResponse.ok) {
          const errorData = await durationResponse.json();
          console.error('❌ Failed to update page duration:', errorData);
        }
      }
    } catch (error) {
      console.error('❌ Error updating page duration:', error);
    }
  }, [pathname, getSessionId]);

  // Initialize tracking
  const initializeTracking = useCallback(async () => {
    try {
      // Only track if we're in the browser and it's a normal navigation
      if (typeof window === 'undefined' || !navigator?.userAgent) {
        return;
      }

      // Prevent multiple initializations
      if (isInitializedRef.current) {
        return;
      }

      isInitializedRef.current = true;

      const visitData = await capturePageVisit();
      if (visitData?.success) {
        // Wait for the page to fully load before updating title
        setTimeout(async () => {
          await updatePageTitle();
        }, 1000);
      }
    } catch (error) {
      // Log error but don't break the app
      console.error('Failed to initialize tracking:', error);
      isInitializedRef.current = false; // Allow retry on next navigation
    }
  }, [capturePageVisit, updatePageTitle]);

  // Handle page exit
  const handlePageExit = useCallback(() => {
    updatePageDuration();
  }, [updatePageDuration]);

  useEffect(() => {
    // Only track traffic if user has consented to analytics cookies
    if (!consent.analytics) {
      return;
    }

    // Reset initialization flag for new pathname
    isInitializedRef.current = false;
    
    // Start tracking
    initializeTracking();
    
    // Add event listeners for page exit
    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('pagehide', handlePageExit);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
      // Update duration when component unmounts (navigation within site)
      updatePageDuration();
    };
  }, [pathname, consent.analytics, initializeTracking, handlePageExit, updatePageDuration]);
  
  return null;
}
