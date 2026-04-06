# Product Requirements Document (PRD): Blue Bits Studio
*Prepared for UI/UX Design & Refactoring*

## 1. Product Overview
**Blue Bits Studio** is a local desktop-class web application built for the "Blue Bits" team. It serves as a centralized hub to process educational materials, lectures, and question banks. The app bridges the gap between raw data (images, PDFs, text) and AI models by guiding non-technical users through structured workflows (OCR Extraction, Formatting, Word Document Generation, AI Drawing, and Quiz Publishing).

**Primary Goal for Redesign:** To refine the UI/UX, making it look professional, modern, and production-ready while strictly adhering to an Arabic-first (RTL) experience. The designer needs to create polished interfaces for complex wizards, code/JSON editors, and media uploaders.

---

## 2. Design System & Technical Constraints

### 2.1 Styling & Technology
*   **Tech Stack:** React 19, Vite 7, React Router 7.
*   **CSS Framework:** **Tailwind CSS v4 exclusively.** All styling must be translatable to Tailwind utility classes. No inline styles unless dynamically calculated.
*   **Icons:** **Lucide React** (`lucide-react`). Do not use custom SVGs unless strictly necessary.
*   **Typography:** **IBM Plex Sans Arabic** (Google Fonts).

### 2.2 Layout & Localization (Crucial)
*   **Directionality:** The app is entirely **Arabic-first (RTL)**. The UI must use logical CSS properties (e.g., `ps-4`, `me-2`, `start-0`) instead of physical ones (`pl-4`, `mr-2`, `left-0`).
*   **Dynamic Text (`dir="auto"`):** The app frequently displays mixed content (Arabic instructions + English Code/JSON). Text areas and preview boxes must gracefully handle mixed LTR/RTL text.

### 2.3 Color Palette (Blue Bits Brand)
| Token | Hex | Usage Context |
| :--- | :--- | :--- |
| **Primary** | `#0072BD` | Main buttons, active nav states, primary borders. |
| **Primary Light** | `#e0f0ff` | Active input backgrounds, subtle highlights. |
| **Primary Dark** | `#005a96` | Hover states for primary elements. |
| **Cyan** | `#33C9FF` | Secondary accents, highlights, specific module types. |
| **Success** | `#009E73` | Completed wizard steps, success toasts, correct answers. |
| **Danger** | `#D32F2F` | Delete actions, error states, destructive buttons. |
| **Sidebar BG** | `#0a1628` | Deep dark blue for the main navigation sidebar. |
| **Surface** | `#f8fafc` | Main application background (Light mode). |
| **Surface Card**| `#ffffff` | Background for cards, panels, and modals (Light mode). |
| **Text Primary**| `#1e293b` | Main readable text. |
| **Text Muted** | `#94a3b8` | Placeholders, disabled states, secondary labels. |

*   **Dark Mode:** The design must include a comprehensive Dark Mode (using Tailwind's `dark:` variant) respecting `prefers-color-scheme`.

---

## 3. Information Architecture & Global Layout

### Global Layout
*   **Navigation:** Fixed **Right-Side Vertical Sidebar** (256px width, `#0a1628` background).
*   **Content Area:** Flexible main area with 24–32px padding. 
*   **Max Widths:** Wizards max-width: 768px. Dashboards/Data-heavy views max-width: 1024px to maintain readability.

### Sitemap (Routes)
1.  `/` - **Dashboard** (Home)
2.  `/extraction` - **Extraction Wizard** (OCR Prep)
3.  `/coordination` - **Coordination Wizard** (Formatting Prep)
4.  `/pandoc` - **Pandoc Wizard** (Markdown to Word Generator)
5.  `/draw` - **AI Drawing Wizard** (Code generation for diagrams)
6.  `/quiz` - **Quiz Hub** (MCQ JSON Editor & Telegram Publisher)
7.  `/history` - **Session History**
8.  `/tour` - **App Onboarding / Tour**

---

## 4. Core Workflows & Page Requirements

### 4.1 Dashboard (`/`)
*   **Purpose:** Landing page and quick access hub.
*   **Key Elements:**
    *   Overview statistics (Cards showing completed lectures, banks, etc.).
    *   "Quick Action" buttons linking to the 5 main tools.
    *   "Recent Sessions" list/table to quickly resume pending work.

### 4.2 Extraction Wizard (`/extraction`)
*   **Purpose:** Prepare prompts and images to send to AI for OCR and text extraction.
*   **Flow (3 Steps):**
    1.  **Metadata:** Mandatory selection between "Lecture (محاضرة)" or "Bank (بنك)". Document naming, numbering, and type (Theory/Practical). *Must not have a default selection.*
    2.  **Inputs (Media & Notes):** 
        *   Drag-and-drop Image Uploader (supports multiple images).
        *   Per-image textarea for specific notes.
        *   General instructions textarea.
    3.  **Preview & Copy:** 
        *   Displays the compiled AI prompt.
        *   Features a **"Guided Copy Loop"** UI: A control that cycles the user through copying the Prompt -> Image 1 -> Image 2 -> Reset. Needs clear active/done states.
        *   Links/Call-to-actions to open Google AI Studio and Obsidian.

### 4.3 Coordination Wizard (`/coordination`)
*   **Purpose:** Format extracted text into standard Markdown.
*   **Flow (2 Steps):**
    1.  **Metadata & Insertion:** Mandatory Lecture vs. Bank selection. A large textarea to paste raw Markdown (brought back from the AI/Obsidian).
    2.  **Preview & Copy:** Compiles the formatting prompt + user text. 1-click copy button to send to AI.

### 4.4 Pandoc Wizard (`/pandoc`)
*   **Purpose:** Convert AI-formatted Markdown into styled `.docx` files.
*   **Flow (3 Steps):**
    1.  **Naming:** Material Name, Lecture Number, Type (Theory/Practical).
    2.  **Input MD:** Textarea to paste Markdown OR a drag-and-drop zone for `.md` files.
    3.  **Execution & Result:** Generate button. Success state must show "Open Document" and "Show in Folder" buttons.
*   **Global Setting:** Needs a UI element to select/display the "Default Save Directory" for generated files.

### 4.5 AI Drawing Wizard (`/draw`)
*   **Purpose:** Generate Python (Matplotlib) code for diagrams based on images.
*   **Flow (2 Steps):**
    1.  **Insertion:** Upload max 3 images. 
        *   *UX Constraint:* If >1 image is uploaded, a clear warning banner must appear indicating potential quality loss.
        *   Per-image notes + general flowchart description.
    2.  **Preview & Copy:** Uses the same "Guided Copy Loop" as Extraction to copy Prompt -> Images to clipboard.

### 4.6 Quiz Hub (`/quiz`)
*   **Purpose:** Centralized hub for generating, editing, previewing, and publishing MCQ quizzes.
*   **Layout:** Complex nested navigation. A Home view with 3 main entry cards leading to sub-sections.
*   **Sub-sections:**
    1.  **Copy Section:** Simple view to copy the base "Quiz Generation Prompt".
    2.  **JSON Editor Section (The most complex UI):** Needs a split-pane or highly organized layout.
        *   *Mode Toggle:* Switch between **Visual Form Mode** and **Raw JSON Mode**.
        *   *Form Mode:* Left column has question/option inputs + correct answer radio buttons. Right column has a live preview of the rendered question. Needs Flag and Delete actions per question.
        *   *Raw JSON Mode:* Left column is a monospace code editor. Right column is the live preview.
        *   *Viewer Controls:* Toggle between "Preview Mode" (shows answers) and "Quiz Mode" (interactive testing). Filter to show only "Flagged" questions.
    3.  **Publisher Section:** Form to input Telegram Bot Token, Chat ID, and Rate Limit Delay. Button to "Publish to Telegram" with progress/status indicators.

### 4.7 History (`/history`)
*   **Purpose:** View past sessions.
*   **UI Elements:** A data table or grid of session cards. Needs filtering (by type: Extraction, Coordination, etc.) and sorting. Clicking a session opens its details to resume work.

---

## 5. Key UI Components (For Designer to Componentize)

1.  **Wizard Stepper:** Horizontal step indicator. Needs clear visual states: `Upcoming` (gray), `Active` (primary blue), `Completed` (green with checkmark).
2.  **Guided Copy Loop:** A unique widget. It acts as a carousel or stepper for clipboard actions. Needs to show what is currently in the clipboard and what is next.
3.  **Drag & Drop Image Uploader:** Area for dropping files. Must display numbered thumbnails (e.g., Image 1, Image 2) and allow appending text notes adjacent to each thumbnail.
4.  **Prompt/Code Previews:** Read-only containers that look like code blocks but support rich RTL/LTR text wrapping. Needs a sticky "Copy" button.
5.  **Split-Pane Editor (Quiz Hub):** A layout pattern allowing side-by-side editing and live previewing, scrollable independently.

---

## 6. Interaction & State Requirements
The design must account for standard web application states:
*   **Empty States:** What does the Dashboard, History, or Quiz Editor look like when there is no data? Include illustrations or helpful CTA buttons.
*   **Loading States:** Skeletons or spinners for processing tasks (especially Pandoc generation or file parsing).
*   **Hover & Focus:** Clear interactive feedback on all buttons, links, and form inputs (using Tailwind rings/outlines).
*   **Form Validation:** Red error text, red borders (`danger` color) for missing mandatory fields (like the Lecture/Bank radio buttons).
*   **Toasts/Notifications:** Non-intrusive popups for "Copied to clipboard", "File saved", or "Error publishing".

---

## 7. File & Resource Mapping (AI Agent Instructions)
The application utilizes a specific set of raw files provided in the `Resources` backend folder:

| Program Section | Target Resource File | How the Program utilizes it |
| :--- | :--- | :--- |
| **Lecture (Extraction)** | `استخراج النص من المحاضرة.md` | Base prompt. Appends general/image notes. |
| **Bank (Extraction)** | `استخراج أسئلة البنك.md` | Base prompt. Appends general/image notes. |
| **Lecture (Coordination)** | `تنسيق المحاضرات.md` | Base prompt. Appends user's Markdown. |
| **Bank (Coordination)** | `تنسيق البنوك.md` | Base prompt. Appends user's Markdown. |
| **Pandoc (Theory)** | `Pandoc-Theo.dotx` | Applied automatically for "نظري". |
| **Pandoc (Practical)**| `Pandoc-Prac.dotx` | Applied automatically for "عملي". |
| **Draw (Code Gen)** | `الرسم بالذكاء الاصطناعي.md`| Base prompt. Appends user diagram description. |

---

## 8. High-level SQLite Database Schema
1.  **Sessions Table:** `Id` (PK), `MaterialName`, `LectureNumber`, `Type` (Theory/Practical), `WorkflowType` (Lecture/Bank/Draw/Pandoc), `CreatedAt`.
2.  **Prompts Table:** `Id` (PK), `SessionId` (FK), `PromptText`, `GeneratedAt`.
3.  **Notes Table:** `Id` (PK), `SessionId` (FK), `NoteText`, `NoteType` (General / ImageLinked), `ImageId` (Nullable FK).
4.  **Images Table:** `Id` (PK), `SessionId` (FK), `LocalFilePath` (e.g., `App_Data/Sessions/123/image-1.jpg`), `OrderIndex`.
5.  **Settings Table:** `Id` (PK), `Key` (e.g., "DefaultPandocSavePath"), `Value`.