# Text for Everyone — Development Status

> See `pandoc-plan.md` for the full development plan.

## App Name
**Text for Everyone**

Chosen: March 2026. Verified clear of conflicts.
Full rename (title bar, GitHub repo, tauri.conf.json identifier,
all documentation) deferred to after Milestone 3 as planned.

## Current Phase
Phase 2 — DOCX Template + Metadata + Frontmatter (nearly complete)

## Completed Milestones
- [x] Milestone 0: Tauri app scaffolded, pushed to GitHub
- [x] Milestone 1: Core conversion (MD / DOCX / HTML), WCAG-compliant
      UI, drag-and-drop, click/Return to browse, reset button, all six
      format pairs tested and confirmed working

## Active Task
Phase 2 is implemented but not yet fully tested or committed.
The following items need to be verified before Milestone 2 is tagged:

1. Test `include-title-block` checkbox — metadata in document properties
   only (unchecked) vs. title block visible in document body (checked)
2. Test find-and-replace with a real conversion
3. Test YAML frontmatter strip (MD input) and inject (MD output)
4. Commit and tag Milestone 2 (`v2.0`)

## Phase 2 Features Implemented
- Two-tab left panel (Convert / Options) with full ARIA keyboard support
- Reference DOCX template: file picker, enable/disable toggle, clear
  button, persists across sessions via tauri-plugin-store
- Metadata editor: Title, Author, Language fields (collapsible, open
  by default)
- Title block opt-in: metadata always written to document properties;
  visible title block in document body only when checkbox is checked
- Find & Replace panel (collapsible, closed by default) applied to
  source content before conversion
- YAML frontmatter: strip from MD input, inject into MD output
- Frontmatter controls visible only when MD is involved in conversion

## Files Modified in Phase 2
- `index.html` — two-tab layout, Options tab content, ARIA roles
- `src/style.css` — tab styles, collapsible panel styles, fieldset
  styles, checkbox styles, template display styles
- `src/main.js` — v5: tab navigation, collapsible panels, template
  picker, store persistence, metadata, find/replace, frontmatter
- `src-tauri/src/main.rs` — pre-processing pipeline, temp file,
  find/replace, frontmatter strip/inject, conditional --standalone,
  reference template, metadata flags, store plugin registered
- `src-tauri/Cargo.toml` — added tauri-plugin-store = "2.4.2"
- `src-tauri/capabilities/default.json` — permissions for dialog,
  fs, shell plugins

## Known Limitations
- **HTML→MD: images inside hyperlinks** — Pandoc outputs raw HTML
  rather than Markdown image syntax when an image is wrapped in an
  `<a>` tag. Image and media folder are correctly generated and path
  is correct. iA Writer does not render inline HTML in MD previews;
  VS Code and Marked 2 handle it correctly. Fix deferred.

## Re-engagement Instructions
To pick up where work left off:

1. Open Terminal and navigate to the project:
   `cd ~/Documents/pandoc-app`
2. Start the dev server:
   `cargo tauri dev`
3. Run the four outstanding tests listed in Active Task above
4. If all tests pass, commit and tag:
   `git add .`
   `git commit -m "Phase 2 complete: templates, metadata, find/replace, frontmatter"`
   `git tag v2.0`
   `git push && git push --tags`
5. Update this status file: mark Milestone 2 complete, set current
   phase to Phase 3

## Former Name Candidates (archived)
**Panda-themed (verified clear)**
- PandaFlux, PandaMorph, PandaShift, PandaPort

**Mission / accessibility-forward (verified clear)**
- Text for All, Text for Everyone ✓ (chosen), Docs for All,
  Docs for Everyone

**Eliminated (taken)**
PandaPress, PandaFlow, PandaCraft, PandaBox, PandaType, TextCraft,
TextForge, TextMorph, WordHerder, DocuBox, Lumen, PandaForge

## Naming Decision
Name selected: **Text for Everyone** (March 2026).
Full rename deferred to after Milestone 3. Renaming affects: app
title bar, README, GitHub repo, tauri.conf.json identifier, and
all documentation.

## Environment
- macOS Sequoia, MacBook Air (Georges-MacBook-Air-2)
- Rust + Cargo, Node.js, Tauri CLI v2, Pandoc, Git, VS Code
- Repo: https://github.com/georgehwilliams/pandoc-app
- Pandoc location: /opt/homebrew/bin/pandoc (Apple Silicon)

## Stretch Goals (parked)
- S1: PDF export
- S2: Braille export (liblouis)
- S3: TEI XML
- S4: Citation/bibliography support
- S5: Custom Pandoc flags per format pair
- S6: Watch folder