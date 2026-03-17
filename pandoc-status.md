# PandocApp — Development Status

> See `pandoc-plan.md` for the full development plan.

## Current Phase
Phase 1 — Core Conversion: MD / DOCX / HTML

## Completed Milestones
- [x] Milestone 0: Tauri app scaffolded, pushed to GitHub

## Active Task
Phase 1 — wiring Tauri native file dialog after resolving browser File API
path limitation. Three plugin dependencies added: tauri-plugin-dialog,
tauri-plugin-fs, tauri-plugin-shell.

## Files Modified This Session
- `index.html` — full semantic HTML, ARIA landmarks, two-panel layout
- `src/style.css` — WCAG 2.2 AA, system color scheme, light/dark mode
- `src/main.js` — frontend logic v2 (native dialog replaces browser File API)
- `src-tauri/src/main.rs` — Pandoc command, find_pandoc(), three plugins registered
- `src-tauri/Cargo.toml` — added tauri-plugin-dialog, tauri-plugin-fs, tauri-plugin-shell
- `src-tauri/tauri.conf.json` — window size, CSP, plugin permissions
- `vite.config.js` — created manually, port fixed to 1420

## Known Issues / Notes
- Browser File API does not expose file paths in Tauri webview — resolved
  by switching to Tauri native dialog (tauri-plugin-dialog)
- Drag-and-drop path resolution still unconfirmed — test after current fix
- Git identity was configured after initial commit (cosmetic, no impact)
- Pandoc path: confirmed via `which pandoc` — find_pandoc() checks common
  locations automatically

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