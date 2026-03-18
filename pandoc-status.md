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

## Name Candidates

All names below have been researched and verified clear of conflicts
unless marked otherwise.

**Panda-themed**
- PandaFlux
- PandaMorph
- PandaShift
- PandaPort

**Mission / accessibility-forward**
- Text for All
- Text for Everyone
- Docs for All
- Docs for Everyone

**Eliminated (taken)**
PandaPress, PandaFlow, PandaCraft, PandaBox, PandaType, TextCraft,
TextForge, TextMorph, WordHerder, DocuBox, Lumen, PandaForge,
PandaPort (clear but weak)

## Naming Decision

Deferred to after Milestone 3. Renaming affects: app title bar, README, GitHub repo, tauri.conf.json identifier, all documentation.

## Known Limitations

- **HTML→MD: images inside hyperlinks** — When an HTML file contains
  an image wrapped in an `<a>` tag, Pandoc outputs raw HTML rather than
  Markdown image syntax. The image and media folder are correctly
  generated and the path is correct, but iA Writer does not render
  inline HTML in Markdown previews. VS Code, Marked 2, and most other
  Markdown renderers handle it correctly. Fix deferred.

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