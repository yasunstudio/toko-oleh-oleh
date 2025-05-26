// Traffic tracking configuration and utilities

export const TRAFFIC_CONFIG = {
  // Data limits
  MAX_URL_LENGTH: 2048,
  MAX_TITLE_LENGTH: 255,
  MAX_REFERRER_LENGTH: 2048,
  MAX_USER_AGENT_LENGTH: 500,
  MAX_IP_LENGTH: 45, // IPv6 max length

  // Session configuration
  SESSION_DURATION: 30 * 24 * 60 * 60, // 30 days in seconds
  SESSION_COOKIE_NAME: 'visitor_session_id',
  
  // Tracking behavior
  BOUNCE_THRESHOLD: 10000, // 10 seconds in milliseconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // Base delay for exponential backoff
  
  // Page title update delay
  TITLE_UPDATE_DELAY: 1000, // 1 second delay to ensure page is loaded
  
  // Paths to ignore in middleware
  IGNORE_PATHS: [
    '/api/',
    '/favicon.ico',
    '/_next/',
    '/images/',
    '/fonts/',
    '/uploads/',
  ],
} as const;

// Device type detection
export function detectDeviceType(userAgent: string): 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN' {
  if (!userAgent) return 'UNKNOWN';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'TABLET';
  } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'MOBILE';
  } else if (ua.includes('desktop') || ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
    return 'DESKTOP';
  }
  
  return 'UNKNOWN';
}

// Data validation utilities
export function validateTrafficData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.url || typeof data.url !== 'string') {
    errors.push('URL is required and must be a string');
  }
  
  if (data.url && data.url.length > TRAFFIC_CONFIG.MAX_URL_LENGTH) {
    errors.push(`URL exceeds maximum length of ${TRAFFIC_CONFIG.MAX_URL_LENGTH} characters`);
  }
  
  if (data.userAgent && typeof data.userAgent !== 'string') {
    errors.push('User agent must be a string');
  }
  
  if (data.ipAddress && typeof data.ipAddress !== 'string') {
    errors.push('IP address must be a string');
  }
  
  if (data.timestamp && isNaN(new Date(data.timestamp).getTime())) {
    errors.push('Invalid timestamp format');
  }
  
  if (data.referrer && data.referrer.length > TRAFFIC_CONFIG.MAX_REFERRER_LENGTH) {
    errors.push(`Referrer exceeds maximum length of ${TRAFFIC_CONFIG.MAX_REFERRER_LENGTH} characters`);
  }
  
  return errors;
}

// Data sanitization utilities
export function sanitizeTrafficData(data: any) {
  return {
    url: data.url?.slice(0, TRAFFIC_CONFIG.MAX_URL_LENGTH),
    referrer: data.referrer?.slice(0, TRAFFIC_CONFIG.MAX_REFERRER_LENGTH),
    userAgent: data.userAgent?.slice(0, TRAFFIC_CONFIG.MAX_USER_AGENT_LENGTH),
    ipAddress: data.ipAddress?.slice(0, TRAFFIC_CONFIG.MAX_IP_LENGTH),
    pageTitle: data.pageTitle?.slice(0, TRAFFIC_CONFIG.MAX_TITLE_LENGTH),
    timestamp: data.timestamp && !isNaN(new Date(data.timestamp).getTime()) 
      ? new Date(data.timestamp) 
      : new Date(),
  };
}

// Check if a request should be tracked
export function shouldTrackRequest(url: string): boolean {
  const path = new URL(url).pathname;
  
  // Ignore certain paths, but allow `/auth/login`
  if (TRAFFIC_CONFIG.IGNORE_PATHS.some(ignorePath => path.startsWith(ignorePath)) && path !== '/auth/login') {
    return false;
  }
  
  return true;
}

// Generate retry delay with exponential backoff
export function getRetryDelay(attempt: number): number {
  return TRAFFIC_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt);
}

// Session ID management utilities
export const SessionManager = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('traffic-session-id');
  },
  
  set: (sessionId: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('traffic-session-id', sessionId);
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('traffic-session-id');
  },
  
  generate: (): string => {
    return crypto.randomUUID();
  }
};

// Traffic source detection
export function detectTrafficSource(referrer: string | null): 'DIRECT' | 'ORGANIC' | 'SOCIAL' | 'REFERRAL' {
  if (!referrer) {
    return 'DIRECT';
  }
  
  const ref = referrer.toLowerCase();
  
  // Search engines
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || 
      ref.includes('duckduckgo.') || ref.includes('baidu.')) {
    return 'ORGANIC';
  }
  
  // Social media
  if (ref.includes('facebook.') || ref.includes('twitter.') || ref.includes('instagram.') ||
      ref.includes('linkedin.') || ref.includes('tiktok.') || ref.includes('youtube.')) {
    return 'SOCIAL';
  }
  
  return 'REFERRAL';
}
