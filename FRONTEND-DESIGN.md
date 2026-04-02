# Blue Bits Studio — Frontend Design System

## Tech Stack
- **Vite 6** + **React 19** + **React Router 7**
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin)
- **lucide-react** for icons
- **IBM Plex Sans Arabic** (Google Fonts)

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0072BD` | Buttons, active nav, links |
| `primary-light` | `#e0f0ff` | Active input backgrounds |
| `primary-dark` | `#005a96` | Hover states |
| `cyan` | `#33C9FF` | Secondary accent, bank type |
| `success` | `#009E73` | Completed steps, success states |
| `danger` | `#D32F2F` | Delete, error states |
| `sidebar` | `#0a1628` | Sidebar background |
| `surface` | `#f8fafc` | Page background |
| `surface-card` | `#ffffff` | Card backgrounds |
| `text` | `#1e293b` | Primary text |
| `text-secondary` | `#64748b` | Secondary text |
| `text-muted` | `#94a3b8` | Muted text, placeholders |
| `border` | `#e2e8f0` | Card/input borders |

## Layout
- **Direction:** RTL (`dir="rtl"` on `<html>`)
- **Sidebar:** Fixed right-side, 256px width, dark blue background
- **Content:** Flexible main area with 24–32px padding
- **Max content width:** 768px (wizards) / 1024px (dashboard, history)

## Component Library

### WizardStepper
Horizontal step indicator: circles + labels + connector lines. States: done (green check), active (blue), upcoming (gray).

### GuidedCopyLoop
Cycles through copy steps (Prompt → Image 1 → Image 2 → ...). Uses Clipboard API with fallback.

### ImageUploader
Drag-and-drop zone with per-image numbered thumbnails and adjacent note textareas.

### PromptPreview
Renders prompt text with per-line `dir="auto"` for mixed Arabic/English/code content.

## Routing

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/extraction` | Extraction Wizard (3-step) |
| `/coordination` | Coordination Wizard (2-step) |
| `/pandoc` | Pandoc Conversion (3-step) |
| `/draw` | AI Drawing Wizard (2-step) |
| `/history` | Session History |

## Data Flow
- **Prompt templates:** Loaded from `Resources/Prompts/` via Vite `?raw` import
- **Sessions:** Stored in `localStorage` (planned migration to SQLite via C# backend)
- **Images:** Handled via browser File API + `URL.createObjectURL`