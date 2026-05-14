# SettingsContext.jsx

## 1. File Name and Directory
`Frontend/src/contexts/SettingsContext.jsx`

### 2. File Type
Frontend (React Context)

### 3. What the file does
Provides global app settings (dark mode, auto-save, default material) via React Context, persisted to `localStorage`.

### 4. User Stories
- As a user, I can toggle dark mode and have my preference remembered across sessions.
- As a user, I can set auto-save on/off and choose a default material, and those persist locally.

### 5. Functions Summary
- `SettingsProvider`: React component that initializes state from localStorage, wraps children with context, and syncs state changes back to localStorage & `<html>` class.
- `useSettings`: Hook to consume settings context from any child component.

### 6. Integration
Does not call backend APIs. All state is persisted purely in browser `localStorage`.

### 7. Imports Summary
- `react`: `createContext`, `useContext`, `useState`, `useEffect`

### 8. Additional Info
Dark mode toggling also adds/removes the `dark` class on `document.documentElement` for Tailwind dark mode support.

### 9. API
No backend communication. Settings are read/written synchronously to `localStorage` on init and on every state change via `useEffect`.
