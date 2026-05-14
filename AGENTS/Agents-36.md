## 1. File Name and Directory
`Frontend/src/pages/Tour.jsx`

### 2. File Type
Frontend

### 3. What the file does
Renders an interactive "guided tour" page displaying available workflows (lecture extraction, question bank extraction, drawing) with their steps, capabilities, and a "start tour" button. Filters visible tours based on user RBAC permissions.

### 4. User Stories
- As a user, I can see which guided tour workflows are available to me based on my permissions.
- As a user, I can start an interactive tour for a workflow to learn the step-by-step process.

### 5. Functions Summary
- `Tour` (default export): Main page component. Filters `TOUR_WORKFLOWS` by user's `hasWorkflowAccess`, renders workflow cards with steps, capabilities, and a start button.

### 6. Integration
No backend API calls. Uses `TourContext.startTour()` (internal state) and `AuthContext.hasWorkflowAccess()` for RBAC filtering.

### 7. Imports Summary
- **External:** `lucide-react` (BookOpen, FlaskConical, Palette, Sparkles, Code, Database, ArrowRight, CheckCircle2, Play, Zap)
- **Internal:** `useTour` from `../contexts/TourContext`, `useAuth` from `../contexts/AuthContext`

### 8. Additional Info
- Arabic-first UI with RTL-friendly Tailwind classes.
- Defines 3 hardcoded workflows: lecture (`LEC_EXT`), question bank (`BANK_EXT`), drawing (`DRAW`).
- Empty state shown when user has no workflow access.

### 9. API
No API interactions. Purely presentational with context-driven RBAC filtering.
