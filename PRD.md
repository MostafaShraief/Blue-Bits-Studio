# Product Requirements Document (PRD): Blue Bits Studio

## 1. Project Overview
**Blue Bits Studio** is a local web application specifically designed for the "Blue Bits" team. The program encapsulates the workflows for processing educational materials, lectures, and question banks (Extraction, Coordination, Pandoc Conversion, Drawing) into a single integrated UI. It aims to reduce human error, organize notes and images effectively, and guide non-technical users step-by-step to manually interact with AI models with maximum consistency.

## 2. Tech Stack & Architecture

### 2.1 Frontend
*   **Framework:** Vite 7 + React 19.
*   **Routing:** React Router 7.
*   **Styling:** Tailwind CSS v4.
*   **UI Direction:** The entire application interface will be in Arabic (RTL).
*   **Dynamic Text Handling:** `dir="auto"` will be used in Markdown and Prompt display areas to dynamically detect the language of each line, ensuring code blocks and English text display Left-to-Right naturally.

### 2.2 Backend & Data Persistence
*   **Framework:** C# .NET (RESTful API).
*   **Database:** **SQLite** (Accessed via EF Core or Dapper). Used to store Sessions, Notes, Prompts, and Image paths.
*   **Data Persistence Strategy:** 
    *   The database stores session metadata.
    *   **Image Storage & Renaming:** Images uploaded by users are saved physically in a local Backend folder (e.g., `App_Data/Sessions/{SessionId}`). 
    *   **Strict Image Renaming:** Upon upload, the program will strip the original filename and strictly rename them sequentially within the session context: `image-1.extension`, `image-2.extension` (e.g., `image-1.png`, `image-2.jpg`).

### 2.3 Resources Folder Structure (Source of Truth)
The C# Backend acts as the container for all static prompts and configuration files. A dedicated `Resources` folder will house the raw Markdown instruction files and Pandoc templates. The Frontend will fetch these files via API to build the final prompts.
*   `Resources/Prompts/` (Contains the `.md` instructions for the AI)
*   `Resources/PandocTemplates/` (Contains `.dotx` styling files)
*   `Resources/Python/` (Contains `template.py`)

*(See Section 6 for exact file mapping).*

---

## 3. UI/UX & Theme
*   **Sidebar:** Vertical and positioned on the **Right** (Right Vertical Sidebar) for native RTL feel.
*   **Primary Colors (Blue Bits Brand):**
    *   Primary Blue: `#0072BD` (Main elements, active states, borders).
    *   Cyan: `#33C9FF` (Highlights and hover states).
    *   Green: `#009E73` (Success indicators, English text/code highlights).
    *   Backgrounds: Clean, light colors for Light Mode.
*   **Dark Mode:** Will be added as a **Final Step** after all core functionalities are completed and tested.

---

## 4. Core Workflows & Tabs

### 4.1. Home / Dashboard
*   A quick dashboard displaying:
    *   Quick statistics (Number of completed Lectures vs. Banks).
    *   "Quick Actions" buttons for direct access to the unified tabs: (**New Extraction**, **New Coordination**, **Pandoc**, **Draw**).
    *   A list of "Recent Sessions" to quickly resume past work.

### 4.2. Extraction (Unified for Lectures & Banks)
*This section handles OCR and initial structuring. The interface is unified, but the backend logic diverges based on the user's mandatory selection.*

*   **Step 1: Naming, Category, & Metadata (Strict Selection)**
    *   **Document Category (محتوى الملف):** A mandatory Radio button or Dropdown with two options: **Lecture (محاضرة)** or **Bank (بنك أسئلة)**.
        *   *Crucial:* There must be **no default selection**. The user must actively choose one. This decision dictates whether the program fetches `استخراج النص من المحاضرة.md` or `استخراج أسئلة البنك.md` from the backend.
    *   Material Name input (e.g., "Database").
    *   Lecture/Bank Number input (e.g., "5").
    *   Document Type (نظري / عملي) - Dropdown/Radio.
    *   *(Note: These inputs dictate the final `.docx` naming in the Pandoc phase).*
*   **Step 2: Inputs (Images & Notes)**
    *   **Images Section:** Users upload unlimited images. The backend instantly saves and renames them sequentially (e.g., `image-1.jpg`, `image-2.jpg`).
    *   **Image Notes:** Each uploaded image provides a multi-line textarea to add notes *specifically linked* to that image.
    *   **General Notes:** A multi-line textarea for general instructions (e.g., "focus on slide 4", "correct spelling of X").
*   **Step 3: Preview & Guided Copy**
    *   **Prompt Generation:** The program fetches the appropriate base instruction file (based on the Step 1 Category choice), injects the user's general notes and image notes cleanly, and displays the final Prompt text.
    *   **Guided Copy Loop:** A UI control indicating the current manual copy step.
        1. Copy the full Prompt text.
        2. Copy Image 1.
        3. Copy Image 2 (until all images are copied).
        4. Loop resets.
    *   Include Previous/Next buttons for manual override.
    *   Short clarification to open AI chat to send this prompt, and recommed AI Studio with a clickable link "aistudio.google.com/prompts/".
    *   clarify and suggest to use Obsidian to verdict output result from AI with original resources from "العضو العلمي".
    *   clarify to go to coordination section after finish.

### 4.3. Coordination (Unified for Lectures & Banks)
*This section formats the extracted text into the Blue Bits Pandoc Markdown format. It also requires the user to specify the category to use the correct formatting rules.*

*   **Step 1: Category Selection & Insertion**
    *   **Document Category (محتوى الملف):** A mandatory selection: **Lecture (محاضرة)** or **Bank (بنك أسئلة)** (No default value).
        *   *Crucial:* This decides whether to fetch `تنسيق المحاضرات.md` or `تنسيق البنوك.md`.
    *   **Insertion:** A large textarea to paste the reviewed/edited Markdown text (usually brought in from Obsidian by the user after the Extraction phase).
*   **Step 2: Preview & Copy**
    *   The program fetches the correct coordination instructions from the `Resources` folder and appends the user's pasted Markdown.
    *   Displays the final Prompt text with a button to copy it to the clipboard to send to the AI.
    *   Short clarification to open AI chat to send this prompt, and recommed AI Studio with a clickable link "aistudio.google.com/prompts/".
    *   clarify to go to Pandoc section and paste AI response there.

### 4.4. Pandoc Conversion
*Transforms the AI-coordinated Markdown into a styled Word Document.*

*   **Settings / Preferences:**
    *   Provide a UI element (e.g., a "Browse" button) allowing the user to select the **Default Save Directory** for generated `.docx` files. The program remembers this choice.
*   **Step 1: Naming**
    *   Auto-populated from the active session, or manually entered: Material Name, Lecture Number, Type (نظري / عملي).
*   **Step 2: Input MD**
    *   A textarea to paste the final Markdown, **OR** a button/drag-and-drop zone to load a `.md` file.
    *   Activates the "Generate Word Document" button.
*   **Step 3: Execution & strict Naming Result**
    *   The backend saves a temporary `.md` file, selects the correct `.dotx` template based on the "Type", and executes the Pandoc command.
    *   **Strict Output Naming Convention:** The resulting file MUST be named dynamically using the inputs: 
        `{Material Name} ({Type}) - {Lecture Number}.docx`
        *(Example Output: `Database (نظري) - 5.docx`)*
    *   **Post-Generation Actions:** Once successful, display two explicit buttons:
        1. **"Open"**: Opens the generated Word document directly.
        2. **"Show in Folder"**: Opens the OS File Explorer highlighting the generated file.
    *   Suggest to use Drawing section to generate drawings for the lecutre (if there are drawings in the lecture).

### 4.5. AI Drawing (الرسم بالذكاء الاصطناعي)
*Guides the AI to generate Python Matplotlib code based on `template.py`.*

*   **Step 1: Insertion**
    *   **Image Limit:** Users can upload a **Maximum of 3 images** per session.
    *   **Warning Note:** if user insert more than 1 image, then a clear UI warning must be displayed stating: *"Note: Adding multiple images may negatively affect the quality and accuracy of the AI-generated drawing."*
    *   **Image Notes:** Each uploaded image includes a dedicated textarea for specific notes.
    *   **Description:** A general multi-line textarea to describe the desired flowchart/diagram.
*   **Step 2: Preview & Copy**
    *   The program merges the description and image notes with the base drawing instructions.
    *   Uses the "Guided Copy Loop" (Copy Prompt -> Copy Image 1 -> etc.) so the user can paste them into the AI chat.
    *   Short clarification to open AI chat to send this prompt, and recommed AI Studio with a clickable link "aistudio.google.com/prompts/".
    *   Short clarification to open VS Code and exectute generated script in the drawing python project.

### 4.6. History
*   A centralized screen displaying all past sessions (Extraction, Coordination, Draw).
*   Users can filter by workflow type.
*   Clicking a session retrieves all data (renamed images, saved text, generated prompts) allowing the user to seamlessly resume or recopy data.

---

## 5. File & Resource Mapping (AI Agent Instructions)

The application utilizes a specific set of raw files provided in the `Resources` backend folder. Here is exactly how the program utilizes them for the AI agent:

| Program Section | Workflow Phase | Target Resource File to use | How the Program utilizes it |
| :--- | :--- | :--- | :--- |
| **Lecture** | Extraction (OCR) | `استخراج النص من المحاضرة.md` | Used as the base prompt. Program appends user's General Notes and Image Notes at the bottom before presenting it for the Guided Copy. |
| **Bank** | Extraction (OCR) | `استخراج أسئلة البنك.md` | Used as the base prompt. Program appends user's General Notes and Image Notes at the bottom before presenting it for the Guided Copy. |
| **Lecture** | Coordination (Formatting) | `تنسيق المحاضرات.md` | Used as the base prompt. Program appends the user's pasted raw Markdown text under the `Content to Convert:` section. |
| **Bank** | Coordination (Formatting) | `تنسيق البنوك.md` | Used as the base prompt. Program appends the user's pasted raw Markdown text under the `Content to Convert:` section. |
| **Pandoc** | Conversion (نظري) | `Pandoc-Theo.dotx` | Applied automatically as the `--reference-doc` argument in the Pandoc shell command when the user selects "نظري". |
| **Pandoc** | Conversion (عملي) | `Pandoc-Prac.dotx` | Applied automatically as the `--reference-doc` argument in the Pandoc shell command when the user selects "عملي". |
| **Draw** | Code Generation | `الرسم بالذكاء الاصطناعي.md` | Used as the base prompt. Instructs the AI on styling rules and available helpers from `template.py`. The user's diagram description is appended at the end. |

---

## 6. High-level SQLite Database Schema

1.  **Sessions Table:**
    *   `Id` (PK), `MaterialName`, `LectureNumber`, `Type` (Theory/Practical), `WorkflowType` (Lecture/Bank/Draw/Pandoc), `CreatedAt`.
2.  **Prompts Table:**
    *   `Id` (PK), `SessionId` (FK), `PromptText`, `GeneratedAt`.
3.  **Notes Table:**
    *   `Id` (PK), `SessionId` (FK), `NoteText`, `NoteType` (General / ImageLinked), `ImageId` (Nullable FK).
4.  **Images Table:**
    *   `Id` (PK), `SessionId` (FK), `LocalFilePath` (e.g., `App_Data/Sessions/123/image-1.jpg`), `OrderIndex` (Integer for the Guided Copy Loop).
5.  **Settings Table:**
    *   `Id` (PK), `Key` (e.g., "DefaultPandocSavePath"), `Value`.