## 1. File Name and Directory
Frontend/src/index.css

### 2. File Type
Frontend — Global styles / Tailwind CSS v4 theme configuration

### 3. What the file does
Defines the app-wide CSS foundation using Tailwind v4's CSS-first config (`@import "tailwindcss"` + `@theme`). Sets custom design tokens (colors, font), RTL direction, scrollbar styling, and reusable animation keyframes for modals, copy feedback, and wizard step transitions. Dark mode overrides are declared in `@layer base .dark`.

### 4. User Stories
- As a user, I see a consistent color scheme (primary blue, success green, danger red) across all pages.
- As a user, I experience smooth fade/scale animations when modals open and close.
- As a user who prefers dark mode, the app surfaces respect system preference with appropriate dark colors.

### 5. Functions Summary
No JavaScript functions — pure CSS. Key custom properties and keyframe animations:
- `@theme tokens`: `--font-sans`, `--color-*` palette (primary, cyan, success, danger, sidebar, surface, text, border)
- `.transition-default`: Generic 0.2s ease transition utility
- `.animate-fade-slide-in`: Wizard step entry animation (opacity + translateY)
- `.animate-copy-flash`: Copy-to-clipboard scale pulse
- `.animate-fadeIn` / `.animate-scaleIn`: Modal entrance animations
- `.animate-fadeOut` / `.animate-scaleOut`: Modal exit animations

### 6. Integration
None. Pure stylesheet — no API calls, database access, or external service interaction.

### 7. Imports Summary
- `@import "tailwindcss"` — Tailwind CSS v4 framework (Vite plugin-processed)

### 8. Additional Info
Arabic-first RTL is enforced at the `html` level (`direction: rtl`). All colors use CSS custom properties for dynamic dark-mode switching. The dark palette in `@layer base .dark` reassigns surface/text/border tokens for dark backgrounds.

### 9. API
No request/response handling.
