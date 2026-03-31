# Product Requirements Document (PRD): Blue Bits Studio

## 1. Project Overview
**Blue Bits Studio** is a local web application specifically designed for the "Blue Bits" team. The program encapsulates the workflows for processing lectures and question banks (Extraction, Coordination, Pandoc Conversion, Drawing) into a single integrated UI. It aims to reduce human error, organize notes and images effectively, and guide non-technical users step-by-step to manually interact with AI models with ease.

## 2. Tech Stack & Architecture
Based on the requirement to simplify installation for standard users while using modern technologies:

### Frontend
*   **Framework:** Vite 7 + React 19.
*   **Routing:** React Router 7.
*   **Styling:** Tailwind CSS v4.
*   **UI Direction:** The entire application interface will be in Arabic (RTL).
*   **Dynamic Text Handling (RTL/LTR):** The `dir="auto"` attribute (or text-parsing libraries) will be used in Markdown and Prompt display areas to dynamically detect the language of each line, ensuring code blocks and English text are displayed correctly from Left-to-Right.

### Backend
*   **Framework:** C# .NET (RESTful API).
*   **Core Responsibilities:**
    *   Provide Endpoints to communicate with the React frontend.
    *   Store and retrieve data from the database.
    *   Handle File System I/O (saving images locally, creating and reading `.md` and `.docx` files).
    *   Execute Shell/CMD commands (specifically running `pandoc` using `.dotx` templates bundled within the backend).

### Database
*   **Type:** **SQLite** (Ideal for desktop/local web apps. It requires no external server installation, and the database file is stored directly in the application folder).
*   **Data Access:** Entity Framework Core (configured for SQLite) or Dapper.
*   **Storage Strategy:**
    *   Every session is saved with all its details (Notes, Prompts).
    *   **Images:** Saved as physical files in a dedicated local folder (e.g., `App_Data/Images`). Only the file paths are stored in the SQLite database to ensure fast performance and prevent database bloat.

---

## 3. UI/UX & Theme
*   **Sidebar:** Vertical and positioned on the **Right** (Right Vertical Sidebar).
*   **Primary Colors (Inspired by the logo and drawing scripts):**
    *   Primary Blue: `#0072BD` (Main elements, buttons, borders).
    *   Cyan: `#33C9FF` (Highlights and Hover states).
    *   Green: `#009E73` (Success indicators, English text/code highlights).
    *   Backgrounds: Clean, light colors for Light Mode.
*   **Dark Mode:** Will be added as a **Final Step** after all core functionalities are built and tested.

---

## 4. Core Workflows & Tabs

### 4.1. Home / Dashboard
*   A quick dashboard displaying:
    *   Quick statistics (Number of completed lectures/banks).
    *   "Quick Actions" buttons for direct access to (New Lecture, New Bank, Pandoc).
    *   A list of "Recent Sessions" for quick resumption.

### 4.2. Lecture & Bank Workflow: Extraction
*The logic is identical for both Lectures and Banks; only the generated baseline Prompt differs.*
Structured as a 3-step Wizard:

*   **Step 1: Naming**
    *   Material Name input.
    *   Lecture Number input.
    *   Lecture Type (Theoretical / Practical) - Dropdown or Radio buttons.
*   **Step 2: Inputs (Images & Notes)**
    *   **Images & Image Notes Section:**
        *   Button to add an image.
        *   Each added image has an adjacent multi-line text area to add notes *specifically linked* to that image.
        *   Users can add unlimited images (Image 1, Image 2, etc.).
    *   **General Notes Section:**
        *   A multi-line text area to add general notes for the lecture/bank (e.g., requesting an edit or focusing on a specific topic).
*   **Step 3: Preview & Guided Copy**
    *   **Preview:** Display the uploaded images horizontally at the top, clearly numbered (Image 1, Image 2...).
    *   **Final Text:** Display the assembled Prompt (containing the base instructions + separated image notes + general notes) supporting `dir="auto"`.
    *   **Guided Copy Loop:**
        *   A control area with a clear "Copy" button indicating the current step.
        *   *The Loop logic:*
            1. Copy the Prompt.
            2. Copy Image 1.
            3. Copy Image 2 (and so on until all images are copied).
            4. Reset the loop back to copying the Prompt.
        *   Previous/Next buttons for manual navigation between copy steps.

### 4.3. Lecture & Bank Workflow: Coordination
*Used after the user copies the Markdown from an external editor (like Obsidian) and validates it.*
*   **Step 1: Insertion**
    *   A large text area to paste the reviewed Markdown text.
    *   The program merges this with the coordination instruction files (Lecture or Bank rules).
*   **Step 2: Preview & Copy**
    *   Display the final merged Prompt.
    *   A button to copy the Prompt to send it to the AI.

### 4.4. Pandoc Conversion
*To convert the final coordinated Markdown file into a styled Word Document.*
*   **Step 1: Naming**
    *   Material Name, Lecture Number, Type (Theoretical/Practical). *(This determines whether `Pandoc-Theo.dotx` or `Pandoc-Prac.dotx` is used behind the scenes).*
*   **Step 2: Input MD**
    *   A text area to paste the Markdown text, **OR** a button to open a `.md` file, **OR** Drag & Drop support.
    *   Once input is provided, the "Generate Word Document" button is enabled.
*   **Step 3: Execution & Result**
    *   The C# backend receives the Markdown, saves it as a temp file, and executes the `pandoc` shell command.
    *   Show a loading state.
    *   On success: Display "Open File" and "Show in Explorer" buttons (handled by C# OS interactions).

### 4.5. AI Drawing (Draw)
*To generate Python graphical codes based on `template.py`.*
*   **Step 1: Insertion**
    *   Upload an image (optional) of the desired drawing, and/or write a multi-line description.
*   **Step 2: Preview & Copy**
    *   Merge the description/image with the `الرسم بالذكاء الاصطناعي.md` instruction file.
    *   Utilize the same "Guided Copy Loop" to copy the Prompt, then the image, to send to the AI.
    *   *(Note: The user will execute the resulting Python code manually outside the program, as requested).*

### 4.6. History
*   A screen displaying all previous Extraction, Coordination, and Draw sessions.
*   Filtering capabilities (Banks / Lectures / Drawings).
*   Clicking a session opens its details (attached images, notes, generated prompts) so it can be easily copied or reviewed again.

---

## 5. High-level SQLite Database Schema

1.  **Sessions Table:**
    *   `Id` (PK), `MaterialName`, `LectureNumber`, `Type` (Theory/Practical), `WorkflowType` (Lecture/Bank/Draw/Pandoc), `CreatedAt`.
2.  **Prompts Table:**
    *   `Id` (PK), `SessionId` (FK), `PromptText`, `GeneratedAt`.
3.  **Notes Table:**
    *   `Id` (PK), `SessionId` (FK), `NoteText`, `NoteType` (General / ImageLinked), `ImageId` (Nullable FK).
4.  **Images Table:**
    *   `Id` (PK), `SessionId` (FK), `LocalFilePath`, `OrderIndex` (The order of the image in the Guided Copy Loop).

---

## 6. Phased Implementation Plan

### Phase 1: Infrastructure
*   Set up the C# REST API project with SQLite configuration.
*   Set up the Vite + React 19 + Tailwind project and configure the RTL environment.
*   Create basic backend Controllers and routing.

### Phase 2: Prompt Workflows (Extraction, Coordination, Draw)
*   Build the Wizard UI screens (Steps 1, 2, 3).
*   Develop the logic for merging text, notes, and instructions to generate Prompts.
*   Develop the "Guided Copy Loop" component for images and text.
*   Implement dynamic LTR/RTL handling in Preview screens.

### Phase 3: Pandoc Integration & File Management
*   Bundle the `.dotx` template files within the C# backend.
*   Write the C# logic to execute CMD/Shell commands for Pandoc.
*   Handle file uploads/text pasting, return results, and trigger OS-level folder opening.

### Phase 4: History & Persistence
*   Connect all workflows to the database to save sessions automatically.
*   Build the History screen to view and reopen past sessions.

### Phase 5: The Final Polish (Dark Mode)
*   Once the application is fully functional and tested, implement Tailwind Dark Mode using color variables to provide a professional, sleek dark interface.