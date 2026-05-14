## 1. File Name and Directory
Frontend/src/components/Layout.jsx

### 2. File Type
Frontend — Layout component / Shell wrapper

### 3. What the file does
Renders the persistent app shell: a sidebar on the left, a scrollable main content area that renders nested route pages via `<Outlet>`, and a tour overlay. Wraps all authenticated pages.

### 4. User Stories
- As a user, I see the sidebar navigation on every authenticated page without re-mounting.
- As a user, I can scroll through page content independently of the sidebar.

### 5. Functions Summary
- `Layout`: Returns the shell JSX — flex container with `Sidebar`, `<Outlet />` inside `<main>`, and `TourOverlay`.

### 6. Integration
No direct backend API calls. Works with React Router's `<Outlet>` to render child routes; `Sidebar` and `TourOverlay` handle their own logic.

### 7. Imports Summary
- **External:** `Outlet` from `react-router`
- **Internal:** `Sidebar` (`./Sidebar`), `TourOverlay` (`./TourOverlay`)

### 8. Additional Info
Uses `ms-64` (logical margin-inline-start) for sidebar offset on `md:` screens, consistent with RTL compatibility. The `h-dvh` and `overflow-hidden` ensure no double scrollbars.

### 9. API
No request/response handling. Acts as a passive shell — data fetching is delegated to child route components rendered via `<Outlet>`.
