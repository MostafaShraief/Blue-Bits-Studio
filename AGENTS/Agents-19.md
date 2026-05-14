## 1. File Name and Directory
`Frontend/src/contexts/TourContext.jsx`

### 2. File Type
Frontend (React Context)

### 3. What the file does
Manages an interactive guided tour (walkthrough) for three workflows: lecture extraction (`LEC_EXT`), bank extraction (`BANK_EXT`), and drawing (`DRAW`). Each tour consists of sequential steps that auto-navigate between routes and auto-fill form fields with dummy data for demonstration. Enforces RBAC before starting a tour.

### 4. User Stories
- As a user, I can start a guided tour that walks me through the lecture/bank/draw workflow step-by-step.
- As a user, I can navigate forward/backward through tour steps with forms auto-populated for me.

### 5. Functions Summary
- `TourProvider`: Context provider; holds `isActive`, `currentWorkflow`, `currentStepIndex` state
- `startTour(workflowId)`: Validates RBAC via `hasWorkflowAccess`, initializes tour, navigates to first step
- `stopTour()`: Resets tour state to inactive
- `nextStep()`: Advances tour to next step or stops if at end
- `prevStep()`: Goes back one step
- `useTour()`: Hook to consume `TourContext`
- `useEffect`: Watches location; runs `autoFill()` when arriving at a step's route

### 6. Integration
No backend/database calls. Integrates with React Router (`useNavigate`, `useLocation`) for step navigation and `AuthContext` (`hasWorkflowAccess`) for permission gating.

### 7. Imports Summary
- `react`: `createContext`, `useContext`, `useState`, `useEffect`
- `react-router`: `useLocation`, `useNavigate`
- `./AuthContext`: `useAuth`

### 8. Additional Info
- `TOUR_DATA` object defines steps per workflow with Arabic titles/content and optional `autoFill` functions that simulate user input via native value setters
- `WORKFLOW_SYSTEM_CODES` maps workflow IDs to backend SystemCodes for RBAC enforcement

### 9. API
No backend API. Pure frontend context; only reads `hasWorkflowAccess` from `AuthContext` for permission checks.
