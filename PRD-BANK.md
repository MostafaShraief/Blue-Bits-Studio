# PRD: Quiz Bank Module

## Overview

The Quiz Bank module provides a centralized hub for generating, editing, previewing, and publishing MCQ (Multiple Choice Question) quizzes. It supports an Arabic-first RTL interface with dark mode.

**Route:** `/quiz`
**File:** `src/pages/QuizHub.jsx`

---

## Navigation Flow

```
/quiz
 └── Home (3-card menu)
      ├── برومبت بناء بنك أسئلة  → Copy Section
      ├── عارض ومحرر JSON        → Editor Section (with sub-navigation)
      └── الناشر (Telegram)      → Publisher Section
```

---

## Sections

### 1. Home (`home`)

Three-card landing page inside the quiz route. Each card navigates to a sub-section.

| Card | Icon | Description |
|------|------|-------------|
| برومبت بناء بنك أسئلة | Wand2 | Copies the MCQ generation prompt for use with AI tools |
| عارض ومحرر JSON | FileJson | Opens the JSON editor/viewer |
| الناشر (Telegram) | MessageCircle | Opens the Telegram publisher |

---

### 2. Copy Section (`copy`)

Allows the user to view and copy the MCQ generation prompt.

- Displays the prompt text from `PROMPTS.mcqGeneration`
- "نسخ البرومبت" button copies to clipboard
- Back button returns to Home

---

### 3. JSON Editor Section (`json`)

The core editing experience. Supports two modes:

#### Mode Toggle
- **نموذج (Form)** — Visual per-question editing with live preview
- **JSON خام (Raw)** — Raw JSON textarea with live viewer

#### Toolbar
| Button | Action |
|--------|--------|
| رفع ملف JSON | Upload a `.json` file |
| تنزيل JSON | Download the current JSON as a file |
| الانتقال للنشر | Navigate to Publisher section |

#### Form Mode
Each question renders as a card with two columns:

| Left Column (Edit) | Right Column (Live Preview) |
|--------------------|---------------------------|
| Question textarea + char counter | Rendered question with correct answer highlighted |
| Options inputs (4 fixed) + char counters | Options with green highlight for correct answer |
| Correct answer selector (single, radio-style) | Explanation box if present |
| Explanation textarea + char counter | |

Per-question actions:
- **Flag** (Flag icon) — Mark question for review
- **Delete** (Trash2 icon) — Remove entire question

Global actions:
- **إضافة سؤال** — Add a new empty question (4 default options)

#### Raw JSON Mode
- Left: Raw JSON textarea (monospace, live parsing)
- Right: Full question viewer with preview/quiz modes, flagging, and clipboard copy

#### Viewer Controls (both modes)
| Control | Action |
|---------|--------|
| وضع المعاينة / وضع الاختبار | Toggle between preview (shows answers) and quiz mode |
| عرض المعلّم فقط | Filter to show only flagged questions |
| نسخ الكل كنص | Copy all questions as formatted text |
| نسخ المعلّم فقط | Copy only flagged questions as text |

#### Quiz Mode Footer
- Shows answered count / total
- "تسليم الاختبار" button to submit
- After submit: shows score, "إعادة الاختبار" button to reset

---

### 4. Publisher Section (`publish`)

Sends questions to Telegram as quiz polls.

#### Inputs
| Field | Description |
|-------|-------------|
| Bot Token | Telegram bot token |
| Chat ID أو @channel | Target chat ID or channel username |
| Delay بين الأسئلة (ms) | Rate limit delay between sends (default: 1200ms, min: 300ms) |

#### Actions
| Button | Action |
|--------|--------|
| رفع ملف JSON | Upload a `.json` file to publish |
| نشر إلى Telegram | Send all questions as Telegram quiz polls |

#### Data Source
Publishes from the currently loaded JSON data (either uploaded or edited in the JSON Editor section).

#### Status
- Shows send count / failure count after completion
- Displays error messages if any

#### Note
Telegram Quiz Poll supports **single correct answer only**. Multi-answer questions are skipped.

---

## Technical Details

### JSON Schema
```json
[
  {
    "type": "mcq",
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correct_options": [0],
    "explanation": "string"
  }
]
```

### State Management
All state is local React `useState` (no backend persistence yet).

| State | Purpose |
|-------|---------|
| `activeSection` | Top-level navigation: home, prompt, editor, publish |
| `editorSubSection` | Editor sub-navigation: menu, copy, json, publish |
| `editMode` | Editor mode: form, raw |
| `quizData` | Parsed quiz array (viewer) |
| `formQuizData` | Form-editable copy of quiz array |
| `editorText` | Raw JSON string |
| `viewMode` | Viewer mode: preview, quiz |
| `flags` | Flagged question indices |
| `answers` | User answers in quiz mode |
| `botToken` / `chatId` | Telegram credentials |

### Data Flow
```
Upload JSON → parse → setQuizData + setFormQuizData + setEditorText
     ↓
Form edits → syncFormToEditor → updates formQuizData + editorText (live)
     ↓
Raw JSON edits → update editorText → editorParsed (useMemo)
     ↓
Apply Edit → parse editorText → update quizData + formQuizData
     ↓
Publish → uses editorParsed.data (if valid) or quizData as source
```

---

## Design System

- **RTL Arabic-first** interface
- **Tailwind CSS v4** exclusively
- **Dark mode** via `dark:` variant
- **lucide-react** icons
- **Logical properties** (`me-`, `ms-`, `inset-e-`) instead of `left`/`right`
- **Font**: IBM Plex Sans Arabic
