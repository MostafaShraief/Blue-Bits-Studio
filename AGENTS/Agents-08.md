## 1. File Name and Directory
`Frontend/src/components/PageLoader.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders a full-screen centered loading spinner with Arabic text "جاري التحميل..." using the `Loader2` icon from `lucide-react`. Used as a fallback UI while async operations (data fetching, lazy loading) are in progress.

### 4. User Stories
- As a user, when the app is fetching data, I see a centered loading spinner so I know the app is working.
- As a developer, I drop `<PageLoader />` into any route/lazy boundary for a consistent loading state.

### 5. Functions Summary
- `PageLoader`: Default export. Returns a full-viewport flex container with a spinning `Loader2` icon and an Arabic loading label.

### 6. Integration
None. Pure presentational component — no API calls, no state management, no side effects.

### 7. Imports Summary
- **External:** `Loader2` from `lucide-react`

### 8. Additional Info
- Uses Tailwind theme variables (`bg-surface`, `text-primary`) for theming.
- Supports dark mode via `dark:bg-surface` and `dark:text-white/80`.
- Arabic-first text ("جاري التحميل...").

### 9. API
None. No backend interaction.
