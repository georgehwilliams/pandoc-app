# PandocApp — Development Status

> See `pandoc-plan.md` for the full development plan.

## Current Phase
Phase 2 — DOCX Template + Metadata + Frontmatter

## Completed Milestones
- [x] Milestone 0: Tauri app scaffolded, pushed to GitHub
- [x] Milestone 1: Core conversion (MD / DOCX / HTML), WCAG-compliant UI,
      drag-and-drop, click/Return to browse, reset button, all six format
      pairs tested and confirmed working

## Active Task
Beginning Phase 2 — reference DOCX template support, metadata editor,
YAML frontmatter control, find-and-replace panel

## Known Issues / Notes
- Drag-and-drop resolved via Tauri onDragDropEvent API
- Browser File API does not expose paths — resolved via tauri-plugin-dialog
- VS Code shows schema warning on tauri.conf.json — cosmetic only, no impact
- Pandoc path: find_pandoc() checks common locations automatically

## Environment
- macOS Sequoia, MacBook Air
- Rust + Cargo, Node.js, Tauri CLI v2, Pandoc, Git, VS Code
- Repo: https://github.com/georgehwilliams/pandoc-app

## Stretch Goals (parked)
- S1: PDF export
- S2: Braille export (liblouis)
- S3: TEI XML
- S4: Citation/bibliography support
- S5: Custom Pandoc flags per format pair
- S6: Watch folder