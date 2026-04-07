# Agent Guidelines: Atomic Commits

## Core Principle
Every commit must be **atomic** — one logical change, one clear purpose, one reversible unit.

---

## Rules for Atomic Commits

### 0. Git Path
Notice that there is not `.git` folder here, the `.git` folder of this project is placed outside this folder, you can access it through this path `D:\Programming\Python\Blue Bits Studio` where `.git` folder is placed.

### 1. ONE Thing Per Commit
Each commit should do **exactly one** of:
- Add a single feature
- Fix a single bug
- Refactor a single module
- Update a single dependency
- Add tests for a single unit

**FORBIDDEN:**
- Mixing feature additions with bug fixes
- Combining refactoring with new features
- Committing unrelated file changes together

### 2. Commit Message Format
```
<type>: <short description>

<long description explaining WHY, not WHAT>
```

**Types:**
| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix or correction |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `chore` | Tooling, config, dependencies |
| `style` | Formatting, whitespace (no logic change) |

**Examples:**
```
feat: add user authentication middleware

Enables JWT-based auth for all API routes.
Required for protecting user-specific endpoints.
```

```
fix: handle null response in data parser

The parser crashed when API returned null instead of empty array.
Added null check before iteration.
```

### 3. Commit Size Guidelines
- **Ideal:** 1-5 files, < 200 lines changed
- **Maximum:** 10 files, < 500 lines changed
- If larger → **split into multiple commits**

### 4. Before Every Commit
- [ ] Code compiles without errors
- [ ] Tests pass for the changed area
- [ ] No debug code or console.log leftovers
- [ ] Commit message explains WHY
- [ ] Only relevant files are staged

### 5. Agent Workflow

```
1. Read the task from .opencode/todo.md
2. Understand the scope (one atomic unit)
3. Make changes to files
4. Run tests / verify
5. Stage ONLY changed files for this task
6. Write atomic commit message
7. Commit
8. Update .opencode/work-log.md
9. Mark task [x] in .opencode/todo.md
```

### 6. Splitting Large Changes
If a feature requires multiple independent changes:

```
feat: add user model          ← commit 1: schema definition
feat: add user validation     ← commit 2: validation logic
feat: add user routes         ← commit 3: API endpoints
test: add user tests          ← commit 4: test coverage
```

### 7. Recovery Rules
- If a commit breaks something → `fix:` commit to repair
- Never amend pushed commits
- Never force push to main/master
- If unsure → ask before committing

---

## Quick Reference

**GOOD commits:**
- `feat: add email validation`
- `fix: prevent race condition in cache`
- `refactor: extract auth logic to separate module`
- `test: add unit tests for parser`

**BAD commits:**
- `update stuff`
- `fix bugs and add login`
- `changes`
- `wip`
