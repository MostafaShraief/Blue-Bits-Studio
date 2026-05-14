## 1. File Name and Directory
`Frontend/src/components/WizardStepper.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders a horizontal step indicator for multi-step wizard workflows. Displays numbered circles with checkmarks for completed steps, highlights the active step, and shows connector lines between steps. Labels are hidden on small screens (`sm:inline`).

### 4. User Stories
- As a user, I can see my current position in a multi-step process at a glance
- As a user, I can visually distinguish completed, active, and pending steps

### 5. Functions Summary
- `WizardStepper({ steps, current })`: Maps an array of step labels and a 0-indexed `current` index into a horizontal stepper UI with circles, labels, and connectors

### 6. Integration
None — pure presentational component with no backend, database, or external service calls

### 7. Imports Summary
- **External:** `Check` icon from `lucide-react`
- **Internal:** None

### 8. Additional Info
Arabic-first RTL app; uses Tailwind v4 theme variables (`bg-success`, `bg-primary`, `bg-border`, `text-text-secondary`, `text-text-muted`) — no hardcoded colors. Responsive: labels hidden on mobile via `hidden sm:inline`.

### 9. API
N/A — no backend communication
