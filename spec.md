# FStudioX

## Current State
FStudioX is a full creative studio (Text, Image, Video, Design editors + Projects panel) with a Landing page and Studio workspace. It has a download button in the Toolbar for exporting files, and Instagram footer link. The app currently has no PWA (Progressive Web App) support — no manifest, no service worker, no install prompt.

## Requested Changes (Diff)

### Add
- `manifest.json` in `public/` with app name, icons, theme colors, display mode `standalone`
- PWA meta tags in `index.html` (theme-color, apple-touch-icon, manifest link)
- `usePWAInstall` hook that listens to `beforeinstallprompt` event and exposes `canInstall` + `install()` method
- "Install App" / "Add to Home Screen" button on the Landing page navbar (next to "Open Studio") that triggers the PWA install prompt
- The same install button in the Studio Toolbar (next to Download)
- On iOS (where `beforeinstallprompt` is not supported), show a tooltip/popover: "Tap Share then 'Add to Home Screen'"

### Modify
- `index.html`: add manifest link, theme-color meta, apple mobile web app meta tags
- `Landing.tsx`: add Install button in navbar CTA area
- `Toolbar.tsx`: add Install button next to Download

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/public/manifest.json` with FStudioX branding (red theme, standalone display)
2. Update `src/frontend/index.html` with manifest link and PWA meta tags
3. Create `src/frontend/src/hooks/usePWAInstall.ts` hook
4. Add Install button to `Landing.tsx` navbar
5. Add Install button to `Toolbar.tsx`
