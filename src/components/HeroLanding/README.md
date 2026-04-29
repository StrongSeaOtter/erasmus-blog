# Hero Landing & Custom Cursor Components

A premium, animated hero section for Docusaurus with custom cursor tracking and interactive hover effects.

## Components Overview

### 1. HeroLanding (src/components/HeroLanding/HeroLanding.tsx)
Full-screen hero section with entrance animation and floating label.

**Features:**
- Full-screen (#002395 deep blue background)
- Centered text: "Here Begins My Erasmus Journey"
- Entrance animation: fade-in + scale-up + letter-spacing (2 seconds)
- Animation runs only once on first load, text stays static after
- Floating label with rolling/marquee text on hover
- Click to scroll to main content
- Responsive design (mobile-friendly)

**Props:**
- `onEnter?: () => void` - Callback when hero is clicked (default: scrolls to main)

### 2. CustomCursor (src/components/CustomCursor/CustomCursor.tsx)
Custom circular cursor that follows mouse with smooth easing.

**Features:**
- Replaces default cursor with custom circle
- Smooth mouse tracking using requestAnimationFrame
- Easing effect (20% lerp) for fluid movement
- Changes appearance when hovering over hero section
- Adds glow effect and grows on active state
- Auto-disabled on mobile devices (< 768px or touch devices)

**No Props** - Automatically detects hero section

### 3. CSS Modules
- `HeroLanding.module.css` - Hero animations, floating label, responsive design
- `CustomCursor.module.css` - Cursor styling and animations

## Animation Details

### Hero Entrance Animation (2 seconds)
```css
Timeline:
0%    → opacity: 0, scale: 0.95, letter-spacing: -0.05em
50%   → opacity: 0.7
100%  → opacity: 1, scale: 1, letter-spacing: 0.02em
```

**Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` - smooth with bounce effect

### Marquee/Rolling Text (infinite)
The floating label text continuously scrolls left:
```
"Enter • Explore • Discover •" (repeating)
```
Duration: 6 seconds per cycle

### Cursor Active State
When hovering over hero:
- Scale: 1 → 1.2
- Opacity: 0.6 → 0.8
- Glow intensity increases
- Border changes to white

## Integration Steps

### Already Done in index.tsx:
```tsx
import HeroLanding from '@site/src/components/HeroLanding/HeroLanding';
import CustomCursor from '@site/src/components/CustomCursor/CustomCursor';

export default function Home() {
  return (
    <Layout>
      <CustomCursor />
      <HeroLanding onEnter={handleHeroEnter} />
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
```

## Customization

### Change Hero Text
Edit [HeroLanding.tsx](./HeroLanding/HeroLanding.tsx) line ~60:
```tsx
<h1 className={styles.heroTitle}>Your Custom Text Here</h1>
```

### Change Background Color
Edit [HeroLanding.module.css](./ HeroLanding/HeroLanding.module.css) line ~7:
```css
background-color: #002395; /* Change this */
```

### Adjust Animation Duration
Edit [HeroLanding.module.css](./HeroLanding/HeroLanding.module.css):
```css
animation: heroFadeInScale 2s cubic-bezier(...) forwards;
          /* Change "2s" to your desired duration */
```

### Change Floating Label Text
Edit [HeroLanding.tsx](./HeroLanding/HeroLanding.tsx) line ~93:
```tsx
<span className={styles.rollingText}>
  Your Text • Here •{' '}
</span>
```

### Customize Cursor Appearance
Edit [CustomCursor.module.css](./CustomCursor/CustomCursor.module.css):
```css
.cursor {
  width: 20px;           /* Size */
  height: 20px;
  background-color: rgba(230, 230, 250, 0.6);  /* Color */
  border-color: #e6e6fa; /* Border */
}
```

### Change Cursor Easing
Edit [CustomCursor.tsx](./CustomCursor/CustomCursor.tsx) line ~54:
```tsx
cursorX += (mouseX - cursorX) * 0.2; /* Change 0.2 (lower = slower) */
```

## Responsive Breakpoints

### Mobile (< 480px)
- Hero text: 1.5rem - 2.5rem
- Label font: 0.65rem
- Custom cursor: disabled (uses default)

### Tablet (480px - 768px)
- Hero text: clamp(1.75rem, 6vw, 3.5rem)
- Label font: 0.75rem
- Custom cursor: disabled

### Desktop (> 768px)
- Hero text: clamp(2.5rem, 8vw, 6rem)
- Label font: 0.875rem
- Custom cursor: enabled

## Accessibility

### Prefers Reduced Motion
If user has `prefers-reduced-motion: reduce` in their OS settings:
- Animations are disabled
- Text appears instantly with final styling
- Marquee text doesn't scroll

### Keyboard Navigation
- Hero section is clickable (pointer/enter key works)
- Proper ARIA labels included
- Focus-visible outlines supported

## Performance Considerations

✅ **Optimized for:**
- CSS animations (GPU-accelerated)
- requestAnimationFrame for cursor tracking
- No heavy animation libraries
- Minimal JavaScript overhead
- Mobile-first approach

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS: cursor disabled by default)
- IE11: Not supported (uses modern CSS features)

## Files Modified

```
src/
├── pages/
│   └── index.tsx (updated)
└── components/
    ├── HeroLanding/
    │   ├── HeroLanding.tsx (NEW)
    │   └── HeroLanding.module.css (NEW)
    └── CustomCursor/
        ├── CustomCursor.tsx (NEW)
        └── CustomCursor.module.css (NEW)
```

## Troubleshooting

**Cursor not showing?**
- Check that CustomCursor is rendered in Layout
- Ensure CSS modules are properly imported
- Check browser console for errors

**Animation not running?**
- Verify HeroLanding component is mounted
- Check that CSS animations aren't disabled in browser DevTools
- Test with `prefers-reduced-motion` settings

**Text not visible on mobile?**
- Adjust font-size clamp values in CSS
- Add more horizontal padding in `.heroTitle`

**Floating label jumpy?**
- Increase easing value (from 0.2 to 0.3) for smoother tracking
- Reduce mouse event frequency or debounce

## Future Enhancements

- Add sound effects (optional)
- Implement parallax scrolling
- Add more marquee text variations
- Support for theme switching
- Animation timeline control
