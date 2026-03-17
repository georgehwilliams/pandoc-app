# PandocApp — Development Plan

## What This App Does

PandocApp is a cross-platform desktop application (macOS and Windows) that converts documents between common formats: Markdown, DOCX, HTML, and EPUB. You drag a file in (or paste a URL), choose an output format, and the app produces a converted file on your local drive. The interface is WCAG 2.2 AA compliant, and HTML output meets the same accessibility standard. The app is built on Pandoc, a best-in-class command-line conversion engine, wrapped in a clean, accessible desktop UI.

Later phases add batch conversion, EPUB output, web import (URL to Markdown), PDF export, Braille export, TEI XML support, and citation/bibliography processing.

---

## Technologies

### Required Installs (Development Environment)

| Tool | Purpose | Install Method |
|---|---|---|
| Rust + Cargo | Tauri backend language | https://rustup.rs |
| Node.js (LTS) | Frontend toolchain | https://nodejs.org |
| Tauri CLI | App build system | `cargo install tauri-cli` |
| Pandoc | Document conversion engine | https://pandoc.org/installing.html |
| Git | Version control | https://git-scm.com |
| VS Code (recommended) | Editor | https://code.visualstudio.com |

### Runtime Dependencies (bundled or assumed present)

| Dependency | Purpose | Notes |
|---|---|---|
| Pandoc | All conversions | Must be on system PATH or bundled |
| readability-lxml (Python) or @mozilla/readability (Node) | Web import / URL cleaning | Phase 3 |
| wkhtmltopdf or LaTeX | PDF export | Stretch Goal 1 |
| liblouis | Braille export | Stretch Goal 2 |
| Saxon / XSLT processor | TEI XML | Stretch Goal 3 |

### Stack

- **Backend:** Rust (Tauri) — shells out to Pandoc, handles file I/O
- **Frontend:** HTML + CSS + Vanilla JS (or lightweight framework if needed)
- **Build target:** `.app` (macOS), `.exe` / NSIS installer (Windows)
- **Version control:** Git + GitHub

---

## Development Plan

### Assumptions

- Work sessions are 4-hour blocks.
- Available bandwidth: 4–8 blocks per week (occasionally more).
- All estimates are in 4-hour blocks. Ranges reflect uncertainty.
- Claude assists with all code generation; your role is direction, testing, and integration.
- Each milestone produces a working, runnable app.

---

## Phase 0 — Environment Setup

**Goal:** Working dev environment, scaffolded Tauri app, pushed to GitHub.

**Tasks:**
1. Install Rust, Node.js, Tauri CLI, Pandoc, Git, VS Code
2. Scaffold new Tauri project
3. Confirm app builds and launches on your machine
4. Initialize GitHub repository, push initial commit
5. Confirm Pandoc is accessible from Tauri backend via shell command

**Estimated blocks:** 1–2

**Milestone 0 ✓** — A bare Tauri window opens. Pandoc version string displays in the UI. Code is on GitHub.

---

## Phase 1 — Core Conversion: MD / DOCX / HTML

**Goal:** Single-file conversion between Markdown, DOCX, and HTML with a minimal but WCAG-compliant interface.

**Tasks:**
1. Design and build accessible UI shell (WCAG 2.2 AA): color contrast, keyboard navigation, focus management, ARIA landmarks
2. Implement drag-and-drop file input
3. Implement format selector (input format auto-detected; output format chosen by user)
4. Implement output filename pattern control (preserve stem, append suffix, choose destination folder)
5. Wire Tauri backend to shell out to Pandoc for MD → DOCX, DOCX → MD, MD → HTML, HTML → MD, DOCX → HTML, HTML → DOCX
6. Ensure HTML output is WCAG 2.2 AA compliant (semantic structure, lang attribute, heading hierarchy)
7. Basic error handling (file not found, Pandoc failure, unsupported format pair)
8. Push to GitHub

**Estimated blocks:** 4–6

**Milestone 1 ✓** — App converts single files across the MD / DOCX / HTML matrix. Interface is keyboard-navigable and passes automated accessibility checks (axe or similar). Output HTML is semantically valid. App runs on macOS.

---

## Phase 2 — DOCX Template + Metadata + Frontmatter

**Goal:** Add reference DOCX template support, metadata editor, and YAML frontmatter control.

**Tasks:**
1. Implement reference `.docx` template selection (stored as user preference)
2. Implement metadata editor panel: title, author, language fields passed to Pandoc
3. Implement YAML frontmatter stripping (clean Markdown output) and injection (add frontmatter to Markdown from metadata fields)
4. Implement find-and-replace panel (applied to source content before conversion)
5. Push to GitHub

**Estimated blocks:** 3–5

**Milestone 2 ✓** — DOCX output uses your reference template. Metadata flows into EPUB and HTML output. Frontmatter can be added or removed. Find-and-replace works before conversion fires.

---

## Phase 3 — EPUB + Batch Conversion + Conversion Log

**Goal:** Add EPUB to the format matrix, batch processing, and a conversion history log.

**Tasks:**
1. Add EPUB as output format (MD → EPUB, DOCX → EPUB, HTML → EPUB)
2. Implement batch conversion: select a folder, choose output format, convert all compatible files
3. Implement conversion history/log panel: timestamp, source file, output format, success/failure, output path
4. Push to GitHub

**Estimated blocks:** 3–5

**Milestone 3 ✓** — App handles EPUB output. Batch jobs run against folders. Log panel records all conversion activity. App runs on macOS and builds successfully on Windows.

---

## Phase 4 — Web Import (URL → Markdown)

**Goal:** Add URL input mode that fetches a webpage, strips boilerplate via Readability, and saves clean Markdown.

**Tasks:**
1. Integrate Readability (Node.js `@mozilla/readability` via Tauri sidecar or JS frontend)
2. Build URL input field in UI with fetch + clean + convert pipeline
3. Handle common failure cases: paywalls, JS-heavy pages, malformed HTML
4. Output cleaned Markdown to user-selected destination
5. Push to GitHub

**Estimated blocks:** 3–4

**Milestone 4 ✓** — User pastes a URL, app fetches and cleans the page content, saves Markdown to local drive. Failure cases surface a clear error message.

---

## Phase 5 — Windows Build + Cross-Platform QA

**Goal:** Confirmed working builds on both macOS and Windows with platform-specific packaging.

**Tasks:**
1. Resolve any platform-specific PATH issues (Pandoc location differs on Windows)
2. Test full feature set on Windows
3. Configure Tauri for Windows installer (NSIS or MSI)
4. Accessibility audit on both platforms
5. Push release builds to GitHub

**Estimated blocks:** 2–4

**Milestone 5 ✓** — App installs and runs correctly on both macOS (Sequoia) and Windows 11. All Milestone 1–4 features confirmed working on both platforms.

---

## Stretch Goals

These are logged and planned but not scheduled. Each will be scoped in detail when the preceding milestone is stable.

| # | Feature | Key Dependency | Complexity |
|---|---|---|---|
| S1 | PDF export | wkhtmltopdf or LaTeX | Medium |
| S2 | Braille export (BRF) | liblouis + Python bindings | Medium-High |
| S3 | TEI XML (import/export) | Saxon / XSLT pipeline | High |
| S4 | Citation / bibliography support | Pandoc + CSL + BibTeX | Medium |
| S5 | Custom Pandoc flags per format pair | UI only, no new dependencies | Low |
| S6 | Watch folder (auto-convert on file drop) | Tauri file watcher | Medium |

---

## GitHub Repository Conventions (Recommended)

- **Branch strategy:** `main` = stable milestone builds; `dev` = active work; feature branches as needed
- **Commit cadence:** Commit at end of each 4-hour block minimum
- **Releases:** Tag each milestone (`v0.1`, `v1.0`, `v2.0`, etc.)
- **README:** Update at each milestone to reflect current feature set

---

## Rough Timeline Estimate

Based on 4–8 blocks per week:

| Phase | Blocks Needed | Weeks at 4 blocks/wk | Weeks at 8 blocks/wk |
|---|---|---|---|
| Phase 0 | 1–2 | 1 | 1 |
| Phase 1 | 4–6 | 1–2 | 1 |
| Phase 2 | 3–5 | 1 | 1 |
| Phase 3 | 3–5 | 1 | 1 |
| Phase 4 | 3–4 | 1 | 1 |
| Phase 5 | 2–4 | 1 | 1 |
| **Total** | **16–26** | **6–8 weeks** | **4–5 weeks** |

Stretch goals are not estimated here and will be scoped individually.