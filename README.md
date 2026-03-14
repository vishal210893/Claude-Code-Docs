# Claude Code — Complete Documentation

> A comprehensive, beautifully styled documentation site for [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) — Anthropic's AI-powered agentic coding assistant. Covers everything from first run to advanced production patterns across 13 structured chapters.

![Claude Code Docs](https://getillustra.blr1.cdn.digitaloceanspaces.com/illustrations/youmind/images/youmind01.webp)

---

## 📖 What's Inside

This documentation site is a static multi-page HTML project covering the full Claude Code feature set:

| Chapter | Title | Topics |
|---------|-------|---------|
| 01 | **Introduction to Claude Code** | Agentic shift, how Claude Code works, first steps, installation |
| 02 | **Context Engineering** | Memory architecture, CLAUDE.md, compression, system prompts |
| 03 | **Claude Code Essentials** | Spec-driven development, plan mode, model selection, sessions |
| 04 | **Essential Commands** | Slash commands, CLI flags, keyboard shortcuts, hooks, custom commands |
| 05 | **Model Context Protocol (MCP)** | MCP architecture, connecting servers, tool schemas, Playwright, GitHub |
| 06 | **GitHub Integration** | PR reviews, issue management, CI/CD pipelines, code generation |
| 07 | **Advanced Workflows** | Orchestration, parallelism, chained tasks, error recovery |
| 08 | **Subagents** | Delegation, context isolation, specialization patterns |
| 09 | **Output Styles** | Formatting, templates, JSON output, structured responses |
| 10 | **Agent Skills** | Custom skills, reusable capabilities, deployment patterns |
| 11 | **Claude Code Desktop** | Extended thinking, longer context, visual debugging |
| 12 | **Deep Agents** | Long-running tasks, state management, planning under pressure |
| 13 | **Agentic Security** | Permissions, prompt injection defense, secrets, blast radius |

---

## ✨ Features

- 🎨 **Modern dark/light theme** with smooth toggle
- 🔍 **Command palette** (`⌘K`) for instant search across all chapters and sections
- 📌 **Sticky Table of Contents** auto-highlights the current section
- 📊 **Syntax-highlighted code blocks** with one-click copy button
- ⚡ **Comparison panels**, callout boxes (tip/warning/note/concept), and data tables
- 📱 **Fully responsive** — works on mobile, tablet, and desktop
- 🌟 **Gradient illustrations** matching chapter context
- 🔗 **Chapter navigation** with prev/next links at the bottom of every page

---

## 🚀 Running Locally

No build tools required. Just serve the files with any static file server.

### Option 1 — Python (recommended, pre-installed on macOS/Linux)

```bash
cd /path/to/documentation
python3 -m http.server 8000
```

Then open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Option 2 — Node.js

```bash
cd /path/to/documentation
npx serve .
```

Then open the URL shown in your terminal.

### Option 3 — VS Code Live Server

Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html`, and select **"Open with Live Server"**.

---

## 📁 Project Structure

```
documentation/
├── index.html              # Home page — chapter grid overview
├── chapter-01.html         # Introduction
├── chapter-02.html         # Context Engineering
│   ... (chapters 03–13)
├── assets/
│   ├── styles.css          # All styling — themes, layout, components
│   └── app.js              # Search, TOC, theme toggle, illustrations
├── convert_md.js           # Utility: converts markdown files to chapter HTML
├── package.json
└── .gitignore
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS (custom design system, CSS variables, dark/light themes) |
| JavaScript | Vanilla JS (no frameworks) |
| Icons | [Lucide Icons](https://lucide.dev/) via CDN |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via Google Fonts |
| Illustrations | [Getillustra CDN](https://getillustra.com/) — 6 illustration packs (see below) |

---

## 🖼 Illustration Sources

All illustrations are sourced from [Getillustra](https://getillustra.com/) and served via their CDN. The copyright for all images belongs to their respective creators.

| Code | Pack | Style | Source |
|------|------|-------|--------|
| `YM` | **Youmind** | Doodle / hand-drawn, knowledge & thinking themes | [getillustra.com/youmind](https://getillustra.com/youmind) |
| `AM` | **Amplemarket** | Clean 2D, professional & workflow themes | [getillustra.com/amplemarket](https://getillustra.com/amplemarket) |
| `SB` | **Saybriefly** | Doodle / Typo, notes, briefs & communication themes | [getillustra.com/saybriefly](https://getillustra.com/saybriefly) |
| `ZC` | **Zeroco2** | Doodle / Typo, nature, structured & systematic themes | [getillustra.com/zeroco2](https://getillustra.com/zeroco2) |
| `IS` | **Iamsteve.me** | 2D, web design, craft & interface themes | [getillustra.com/iamsteve-me](https://getillustra.com/iamsteve-me) |
| `PH` | **Pointhound** | 2D character illustrations, action & motion themes | [getillustra.com/pointhound](https://getillustra.com/pointhound) |

CDN base URL: `https://getillustra.blr1.cdn.digitaloceanspaces.com/illustrations`

---

## 🎨 Design System

The entire site uses CSS custom properties defined at the top of `assets/styles.css`:

- **Color tokens**: `--accent`, `--bg`, `--bg-2`, `--bg-3`, `--text`, `--text-2`, `--text-3`, `--border`
- **Semantic colors**: `--green`, `--red`, `--blue`, `--orange` with `*-dim` variants for backgrounds
- **Transitions**: `--t` (150ms ease) for uniform animation speed
- **Border radius**: `--r` (12px) and `--r-lg` (16px)
- **Shadows**: `--shadow-sm` and `--shadow`

Dark mode is the default; light mode is toggled via `data-theme="light"` on `<html>`.

---

## 📝 Adding / Editing Content

Each chapter is a standalone HTML file following this structure:

```html
<!-- Section block -->
<section class="section" id="section-id">
  <div class="section-eyebrow"><span class="s-cat">Category</span></div>
  <h2>Section Title</h2>
  <p class="lead">Section description...</p>

  <div class="sub">
    <h3>Subsection</h3>
    <!-- Code blocks, tables, callouts go here -->
  </div>
</section>
```

### Callout Types

```html
<div class="callout tip"><strong>Tip:</strong> Your tip text with <span class="ic">inline code</span>.</div>
<div class="callout warning"><strong>Warning:</strong> Important caveat.</div>
<div class="callout note"><strong>Note:</strong> Additional context.</div>
<div class="callout concept"><div class="ct"><i data-lucide="key" class="icon"></i> Concept Title</div><p>Explanation...</p></div>
```

### Code Block with Header

```html
<div class="code-block">
  <div class="cb-header">
    <span class="cb-lang">bash</span>
    <span class="cb-title">Example title</span>
  </div>
  <pre><code>your code here</code></pre>
</div>
```

---

## 📦 Deploying

Since this is fully static HTML, it can be deployed to any static host:

- **GitHub Pages** — push to `gh-pages` branch or configure in repo settings
- **Netlify / Vercel** — connect the repo and deploy root as the publish directory
- **AWS S3 + CloudFront** — sync the directory and enable static website hosting
- **Any web server** — copy files to your server's `public_html` or `www` directory

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b improve/chapter-name`
3. Make your changes to the relevant `chapter-XX.html` or `assets/` files
4. Push and open a PR

---

## 📄 License

MIT — feel free to adapt and build upon this documentation structure for your own documentation projects.

---

<p align="center">Built with ❤️ for the Claude Code community</p>
