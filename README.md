# Text for Everyone

A cross-platform desktop application for converting documents between
Markdown, DOCX, HTML, and EPUB using Pandoc.

Built with Tauri, Vite, and Vanilla JS.

---

## About This Project

Text for Everyone is an experiment in human-AI collaboration. I am a humanities
professor — not a software developer — building this application with the
assistance of Claude AI (Anthropic) through a process sometimes called
"vibe coding": describing what I want in plain language and working
iteratively with an AI collaborator to produce working software.

The goal is to demonstrate that people without traditional programming
backgrounds can build useful, accessible, well-designed tools by combining
domain expertise with AI assistance.

---

## What It Does

Text for Everyone wraps [Pandoc](https://pandoc.org), a best-in-class
command-line document conversion engine, in a clean, accessible desktop
interface. You select a file, choose an output format, and click Convert.
No command line required.

**Supported conversions:**

| From | To |
|---|---|
| Markdown (.md) | DOCX, HTML |
| Word Document (.docx) | Markdown, HTML |
| HTML (.html) | Markdown, DOCX |

EPUB support is planned for a later release.

---

## Accessibility

Accessibility is a core design principle, not an afterthought.

- The application interface targets **WCAG 2.2 AA** compliance
- HTML output is structured to meet the same standard
- The UI supports keyboard navigation throughout
- All interactive elements are properly labeled for screen readers
- The interface respects your operating system's light/dark mode preference
- Focus indicators are visible and meet WCAG contrast requirements

If you encounter an accessibility barrier, please open an issue.

---

## Design Philosophy

- **Simple by default.** The interface does one thing and does it well.
- **Local first.** All conversion happens on your machine. No files are
  sent to any server.
- **Accessible by design.** WCAG compliance is built in from the start,
  not retrofitted.
- **Open source.** Built on open tools (Pandoc, Tauri, Vite) and released
  under the GPL.

---

## How Text for Everyone Is Different

Several Pandoc GUI wrappers and document converters already exist. Here
is how Text for Everyone differs from the most common alternatives.

**Compared to other Pandoc GUIs (PanWriter, PanConvert, Pandoc.app):**
PanWriter is an editor first — you open a file, edit it, then export.
Text for Everyone is a converter first: drop a file in, get a converted
file out, no editing required. PanConvert is dated, unmaintained, and has
a fragile dependency stack. Pandoc.app is macOS-only and minimal. Text for
Everyone targets both macOS and Windows from the ground up and is designed
for users who have no interest in the command line.

**Compared to Mac App Store converters:**
The most popular App Store converters (The Document Converter, File
Converter) send your files to remote servers for processing, raising
privacy concerns. Text for Everyone converts everything locally — your
files never leave your machine. Several App Store options are also
unmaintained, have undisclosed privacy practices, or hide behind paywalls
after a limited free tier.

**Accessibility:**
No existing Pandoc GUI — and none of the App Store converters surveyed —
makes WCAG compliance a stated design goal. Text for Everyone does, for
both the application interface and its HTML output. This makes it the only
document converter in this space designed from the start to be usable by
people who rely on assistive technology.

**Transparency:**
Text for Everyone is open source (GPL-3.0), built by a non-developer using
AI assistance, and developed entirely in public on GitHub. The development
plan, status, and decision log are versioned alongside the code. There
are no ads, no subscriptions, no telemetry, and no server-side processing.

---

## Technology

| Component | Technology |
|---|---|
| Desktop framework | [Tauri](https://tauri.app) (Rust backend) |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Conversion engine | [Pandoc](https://pandoc.org) |
| Build tool | [Vite](https://vitejs.dev) |
| Version control | Git / GitHub |

---

## Development Status

This project is under active development. See
[`pandoc-status.md`](./pandoc-status.md) for the current state and
[`pandoc-plan.md`](./pandoc-plan.md) for the full development roadmap.

**Current phase:** Phase 2 — DOCX Template + Metadata + Frontmatter

---

## Planned Features

- EPUB export
- Batch conversion
- Web import (URL → Markdown)
- Reference DOCX template support
- YAML frontmatter control
- Metadata editor
- PDF export *(stretch goal)*
- Braille export / BRF *(stretch goal)*
- TEI XML support *(stretch goal)*
- Citation / bibliography support *(stretch goal)*

---

## Requirements

### macOS
- macOS Sequoia or later
- [Pandoc](https://pandoc.org/installing.html) installed on your system

### Windows
- Windows 10 or later
- [Pandoc](https://pandoc.org/installing.html) installed on your system
- Windows support is actively planned and is a core project goal,
  not an afterthought. Cross-platform compatibility is built into
  the architecture from the start.

Cross-platform builds are handled by [Tauri](https://tauri.app), which
produces native `.app` bundles for macOS and `.exe` installers for
Windows from the same codebase.

---

## License

GPL-3.0. See [LICENSE](./LICENSE) for details.

Pandoc is © John MacFarlane and released under the GPL.