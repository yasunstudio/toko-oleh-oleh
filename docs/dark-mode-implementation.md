# Dark Mode Implementation

This document explains how dark mode has been implemented in the Toko Oleh-Oleh application.

## Overview

The application now supports three theme modes:
- Light Mode
- Dark Mode
- System Mode (follows user's system preference)

The implementation uses `next-themes` library with Tailwind CSS for styling and respects the user's cookie consent preferences.

## Architecture

### Core Components

1. **Theme Provider**
   - Location: `src/components/theme-provider.tsx`
   - Purpose: Wraps the application with the next-themes provider
   - Features: Supports attribute-based theme switching with class strategy

2. **Theme Toggle**
   - Location: `src/components/ui/theme-toggle.tsx`
   - Purpose: Dropdown menu for selecting theme preference (light/dark/system)
   - Features: Interactive toggle with animation between sun/moon icons

3. **Cookie Integration**
   - Location: `src/lib/cookie-config.ts`
   - Purpose: Integrates theme preference with cookie consent system
   - Features: Theme preferences are stored as functional cookies

4. **Theme + Consent Hook**
   - Location: `src/hooks/use-theme-with-consent.ts` 
   - Purpose: Custom hook that respects user's cookie consent when setting theme
   - Features: Falls back to system theme when functional cookies are disabled

## CSS Variables

CSS variables for both light and dark modes are defined in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* Additional light theme variables... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* Additional dark theme variables... */
}
```

## Usage

### Consuming Dark Mode in Components

Components automatically adapt to dark mode using Tailwind CSS classes:

```tsx
<div className="bg-background text-foreground dark:bg-gray-900 dark:text-white">
  Content that respects current theme
</div>
```

### User Interface

The theme toggle is available in:
- Main navigation bar
- Admin navigation bar

Users can select their preferred theme through the dropdown menu, which will be persisted if they've consented to functional cookies.

## Privacy Considerations

- Theme preferences are stored as a functional cookie
- If the user has not consented to functional cookies:
  - The theme will still change for the current session
  - Preference will not persist beyond page reload
  - System theme becomes the default

## Future Improvements

Potential future improvements:
- Add animation during theme transitions
- Implement prefers-color-scheme media query for initial SSR
- Create component-specific dark mode variations
- Improve dark mode for charts and data visualizations

## Related Files

- `src/components/providers.tsx`: Application provider wrapper
- `src/app/layout.tsx`: Root layout with theme provider integration
- `tailwind.config.ts`: Tailwind configuration for dark mode
- `src/components/ui/cookie-consent-banner.tsx`: Cookie consent integration
