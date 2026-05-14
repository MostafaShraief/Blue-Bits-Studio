## 1. File Name and Directory
Frontend/src/components/TourOverlay.jsx

### 2. File Type
Frontend — React component (guided tour overlay)

### 3. What the file does
Renders a floating tooltip/overlay card during an interactive app tour. It highlights the target element with a ring, positions the card near it (below by default, above if no space), and provides step navigation (prev/next) with a progress indicator. Renders via `createPortal` at `document.body`.

### 4. User Stories
- As a new user, I follow a guided step-by-step tour that highlights UI elements and explains what they do.
- As a user, I navigate through tour steps, skip the tour, or finish it early.

### 5. Functions Summary
- `TourOverlay`: Main component — reads tour state from `TourContext`, queries the DOM for the target element via CSS selector, computes its bounding rect for absolute positioning, renders a styled card with title, content, navigation buttons, step counter, and a directional arrow.

### 6. Integration
No backend calls. Purely client-side: uses DOM API (`querySelector`, `getBoundingClientRect`, `scrollIntoView`, classList) and the `TourContext` state machine.

### 7. Imports Summary
- **External:** `react` (useEffect, useState), `lucide-react` (X, ArrowRight, ArrowLeft), `react-dom` (createPortal)
- **Internal:** `../contexts/TourContext` (useTour — provides isActive, currentStep, stopTour, nextStep, prevStep, currentStepIndex, totalSteps)

### 8. Additional Info
Smart positioning: if the card would overflow below the viewport, it renders above the target instead. The arrow indicator flips accordingly. A highlight ring (`ring-4 ring-primary`) is added/removed from the target element on mount/unmount. Supports window resize and scroll events. Arabic-first (RTL layout, Arabic button labels).

### 9. API
No API communication. All state comes from `TourContext` (client-side context). UI-only component.
