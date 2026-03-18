## What I'm Building and How

### The Problem

Anyone who works with documents — writers, teachers, researchers, administrators — knows the frustration of file format incompatibility. You write something in Markdown, but your colleague needs a Word document. You receive an HTML file, but you need to edit it in Word. You want to publish a clean, accessible webpage from a document you already wrote. Converting between these formats is either technically difficult, requires expensive software, or means sending your files to a website you've never heard of and hoping for the best.

### The Solution

I'm building a desktop application called **PandocApp** that makes document format conversion simple, private, and accessible to anyone. You open the app, drop in a file, choose the format you want, and click Convert. That's it. The converted file appears on your computer. Nothing is sent to any server. Nothing requires a subscription. Nothing requires you to know anything about the technical tools running underneath.

The app converts between Markdown, Microsoft Word (DOCX), HTML, and EPUB — the formats that matter most for writers, educators, and anyone who publishes content online. A core design goal is that the app itself, and the documents it produces, meet WCAG 2.2 AA accessibility standards — meaning they are designed to be usable by people who rely on screen readers, keyboard navigation, or other assistive technologies. This is unusual: no comparable tool makes accessibility a stated priority.

### The Method

Here's where the project gets interesting. I am a humanities professor, not a software developer. I have no formal training in programming. And yet I am building a fully functional, cross-platform desktop application from scratch.

I'm doing this through a collaborative process with Claude, an AI assistant made by Anthropic. Rather than writing code myself, I describe what I want in plain English — what the interface should look like, how a feature should behave, what happens when something goes wrong — and Claude generates the code. I then paste that code into the appropriate files, run the application, and report back what happens. When something doesn't work, I describe the problem and we work through it together.

This approach is sometimes called **vibe coding** — a term for using AI assistance to build software through conversation and iteration rather than through traditional programming expertise. It's a genuine experiment in whether domain knowledge and clear thinking can substitute for technical training when an AI handles the implementation details.

The project is entirely open source and developed in public on GitHub. The development plan, the decision log, and every version of every file are visible to anyone who wants to follow along or learn from the process. The goal is not just to build a useful tool, but to demonstrate that this kind of human-AI collaboration is possible — and to document honestly what that process looks like, including the dead ends and the debugging sessions.

### Where It's Going

The application currently runs on macOS and converts between Markdown, Word, and HTML. Upcoming work will add EPUB support, batch conversion of multiple files at once, the ability to paste a webpage URL and save its content as a clean Markdown file, and eventually a Windows version. Longer-term stretch goals include PDF export and Braille output — making the tool useful for a wider range of accessibility needs than any comparable application currently addresses.