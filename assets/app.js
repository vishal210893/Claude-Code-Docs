'use strict';

/* ── Theme ──────────────────────────────────────────────── */
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}" class="icon"></i>`;
    themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (window.lucide) {
      window.lucide.createIcons({ root: themeToggle });
    }
  }
}

function initTheme() {
  const saved = localStorage.getItem('cc-docs-theme');
  applyTheme(saved || (prefersDark.matches ? 'dark' : 'light'));
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('cc-docs-theme', next);
    applyTheme(next);
  });
}
initTheme();

/* ── Reading Progress ───────────────────────────────────── */
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }, { passive: true });
}

/* ── Back to Top ────────────────────────────────────────── */
const btt = document.getElementById('back-to-top');
if (btt) {
  window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 500), { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Generate Right ToC ─────────────────────────────────── */
function buildToc() {
  const panel = document.getElementById('page-toc');
  if (!panel) return;

  // Sections carry the id; headings (h2/h3) are children without ids.
  // Collect every section/sub with an id that has an h2 or h3.
  const entries = [];
  document.querySelectorAll('.main-content [id]').forEach(el => {
    const h = el.querySelector(':scope > h2, :scope > h3');
    if (h) entries.push({ id: el.id, tag: h.tagName, text: h.textContent.replace(/[¶#]/g, '').trim() });
  });

  // Also pick up any h2/h3 that already carry their own id
  document.querySelectorAll('.main-content h2[id], .main-content h3[id]').forEach(h => {
    if (!entries.find(e => e.id === h.id))
      entries.push({ id: h.id, tag: h.tagName, text: h.textContent.replace(/[¶#]/g, '').trim() });
  });

  if (!entries.length) return;

  const label = document.createElement('div');
  label.className = 'rt-title';
  label.textContent = 'On This Page';
  panel.appendChild(label);

  entries.forEach(e => {
    const a = document.createElement('a');
    a.className = 'toc-link' + (e.tag === 'H3' ? ' is-h3' : '');
    a.href = '#' + e.id;
    a.textContent = e.text;
    panel.appendChild(a);
  });
}
buildToc();

/* ── Active Section Tracking ────────────────────────────── */
function initTracking() {
  const elements = document.querySelectorAll('.main-content [id]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      document.querySelectorAll('#page-toc .toc-link').forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === id));
    });
  }, { rootMargin: '-10% 0px -80% 0px' });

  elements.forEach(el => observer.observe(el));
}
initTracking();

/* ── Copy Link to Headings ──────────────────────────────── */
function initHeadingLinks() {
  document.querySelectorAll('.main-content h2[id], .main-content h3[id]').forEach(h => {
    const a = document.createElement('a');
    a.className = 'anchor-link';
    a.href = '#' + h.id;
    a.textContent = ' ¶';
    a.title = 'Copy link';
    a.addEventListener('click', e => {
      e.preventDefault();
      navigator.clipboard.writeText(location.href.split('#')[0] + '#' + h.id).then(() => {
        a.textContent = ' ✓';
        Object.assign(a.style, { color: 'var(--green)', opacity: 1 });
        setTimeout(() => { a.textContent = ' ¶'; a.style.cssText = ''; }, 1500);
      });
      history.pushState(null, '', '#' + h.id);
    });
    h.appendChild(a);
  });
}
initHeadingLinks();

/* ── Copy Code Buttons ──────────────────────────────────── */
function initCopyCode() {
  /* Handle existing .copy-btn elements (inside .code-header) */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block')?.querySelector('pre');
      if (!pre) return;
      navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
      });
    });
  });

  /* Inject copy buttons into .cb-header blocks that don't have one */
  document.querySelectorAll('.cb-header').forEach(header => {
    if (header.querySelector('.copy-btn')) return; /* already has one */
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    header.appendChild(btn);
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block')?.querySelector('pre');
      if (!pre) return;
      navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      });
    });
  });
}
initCopyCode();

/* ── Sidebar Builder ─────────────────────────────────────── */
(function buildSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const seg = window.location.pathname.match(/chapter-(\d+)/)?.[0] || '';

  const G = {
    foundations: '#9d8df1',
    cli:         '#60a5d4',
    advanced:    '#4db8a0',
    expert:      '#8f8ac8',
  };

  const CHAPTERS = [
    { n:'01', label:'Introduction',        icon:'rocket',   color:G.foundations, group:'Foundations' },
    { n:'02', label:'Context Engineering', icon:'brain',      color:G.foundations, group:'Foundations' },
    { n:'03', label:'Essentials',          icon:'terminal',        color:G.foundations, group:'Foundations' },
    { n:'04', label:'Commands',            icon:'code',            color:G.cli,         group:'CLI & Tools'  },
    { n:'05', label:'MCP',                 icon:'network',             color:G.cli,         group:'CLI & Tools'  },
    { n:'06', label:'GitHub Integration',  icon:'git-merge',      color:G.cli,         group:'CLI & Tools'  },
    { n:'07', label:'Advanced Workflows',  icon:'network',    color:G.advanced,    group:'Advanced'     },
    { n:'08', label:'Subagents',           icon:'bot',       color:G.advanced,    group:'Advanced'     },
    { n:'09', label:'Output Styles',       icon:'layout-template',   color:G.advanced,    group:'Advanced'     },
    { n:'10', label:'Agent Skills',        icon:'puzzle',       color:G.expert,      group:'Expert'       },
    { n:'11', label:'Desktop',             icon:'monitor', color:G.expert,      group:'Expert'       },
    { n:'12', label:'Deep Agents',         icon:'brain',  color:G.expert,      group:'Expert'       },
    { n:'13', label:'Security',            icon:'shield',          color:G.expert,      group:'Expert'       },
  ];

  const activeIdx = CHAPTERS.findIndex(c => seg === `chapter-${c.n}`);
  const pct = activeIdx >= 0 ? Math.round(((activeIdx + 1) / CHAPTERS.length) * 100) : 0;
  const pLabel = activeIdx >= 0 ? `${activeIdx + 1} of 13` : 'Overview';

  const groups = {};
  CHAPTERS.forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });

  let html = `
    <div class="sb-header">
      <a class="sb-brand" href="index.html">
        <div class="sb-brand-icon">CC</div>
        <div>
          <div class="sb-brand-name">Claude Code</div>
          <div class="sb-brand-sub">Documentation</div>
        </div>
      </a>
    </div>

    <div class="sb-progress-wrap">
      <div class="sb-progress-track"><div class="sb-progress-fill" style="width:${pct}%"></div></div>
      <span class="sb-progress-txt">${pLabel} chapters</span>
    </div>

    <a class="sb-home${!seg ? ' active' : ''}" href="index.html">
      <span class="sb-home-icon"><i data-lucide="home" class="icon"></i></span>
      <span>Overview</span>
    </a>
    <div class="sb-divider"></div>`;

  Object.entries(groups).forEach(([grp, chs]) => {
    html += `<div class="sb-group-label">${grp}</div>`;
    chs.forEach(ch => {
      const on = seg === `chapter-${ch.n}`;
      html += `
      <a class="sb-link${on ? ' active' : ''}" href="chapter-${ch.n}.html" style="--ch-color:${ch.color}">
        <span class="sb-ch-icon"><i data-lucide="${ch.icon}" class="icon"></i></span>
        <span class="sb-link-text">${ch.label}</span>
        <span class="sb-ch-num">${ch.n}</span>
      </a>`;
    });
  });

  html += `
    <div class="sb-deco">
      <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="230" cy="30" r="70" fill="url(#sbg1)" opacity="0.18"/>
        <circle cx="50"  cy="120" r="50" fill="url(#sbg2)" opacity="0.14"/>
        <defs>
          <radialGradient id="sbg1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#a78bfa"/>
            <stop offset="100%" stop-color="#58a6ff" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="sbg2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#3fb950"/>
            <stop offset="100%" stop-color="#3fb950" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    </div>`;

  sidebar.innerHTML = html;
  if (window.lucide) {
    window.lucide.createIcons({ root: sidebar });
  }
})();

/* ── Mobile Sidebar ─────────────────────────────────────── */
function initMobileSidebar() {
  const btn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!btn || !sidebar) return;

  const close = () => { sidebar.classList.remove('open'); overlay?.classList.remove('open'); };
  btn.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay?.classList.toggle('open'); });
  overlay?.addEventListener('click', close);
  document.querySelectorAll('.sb-link, .sb-home').forEach(a => a.addEventListener('click', close));
}
initMobileSidebar();

/* ── Collapsible Sections ───────────────────────────────── */
function initCollapsible() {
  document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body = trigger.nextElementSibling;
      const isOpen = body?.style.display !== 'none';
      if (body) body.style.display = isOpen ? 'none' : '';
      trigger.classList.toggle('collapsed', isOpen);
    });
  });
}
initCollapsible();


/* ── Zeroco2 Section Illustrations ──────────────────────── */
(function initZeroco2() {
  const ZC = f => `https://getillustra.blr1.cdn.digitaloceanspaces.com/illustrations/zeroco2/images/${f}.webp`;
  const CHAPTERS = {
    'chapter-01': [[5, ZC('7oVybqGTXA4wr3sA6tRYF7'), 'r']],
    'chapter-02': [[5, ZC('BiBiqbVbwWwjq6DHBnkgFq'), 'r']],
    'chapter-04': [[1, ZC('M2Yz7vjRmpC8roWVedaXVZ'), 'r']],
    'chapter-06': [[3, ZC('e2Dco3fogewgWpk4ctCMFB'), 'r']],
    'chapter-08': [[1, ZC('hWh38BPaZujRRZHk45k3h2'), 'r']],
    'chapter-09': [[3, ZC('8tnpZhPwSHo4coF9jw2W4H'), 'r']],
    'chapter-11': [[3, ZC('ZsCUGfVjaPKdBCbJtHFmxB'), 'r']],
    'chapter-13': [[3, ZC('f9LsN5SgYdQKU8eZ2okord'), 'r']],
  };
  const sects = CHAPTERS[location.pathname.split('/').pop().replace('.html', '')];
  if (!sects) return;
  const sections = document.querySelectorAll('.main-content .section');
  sects.forEach(([idx, url, side]) => {
    const sect = sections[idx]; if (!sect) return;
    const img = document.createElement('img');
    img.src = url; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    img.className = 'sect-illus sect-illus--' + (side === 'r' ? 'right' : 'left');
    const anchor = sect.querySelector('.lead') || sect.querySelector('h2');
    if (anchor && anchor.nextSibling) sect.insertBefore(img, anchor.nextSibling);
    else sect.appendChild(img);
  });
})();

/* ── Comprehensive Search Index ─────────────────────────── */
const SEARCH_INDEX = [
  // Chapter 01 — Introduction
  { num: '01', title: 'What is Claude Code', desc: 'AI coding agent that runs in your terminal with full filesystem access', chapter: 'Introduction', href: 'chapter-01.html#what-is', kw: 'claude code cli terminal agentic ai coding tool' },
  { num: '01', title: 'The Agentic Shift', desc: 'From autocomplete to autonomous agent — the fundamental change in AI coding', chapter: 'Introduction', href: 'chapter-01.html#agentic-shift', kw: 'agentic autonomous agent shift paradigm coding assistant' },
  { num: '01', title: 'Core Capabilities', desc: 'File system access, shell commands, git, MCP tools, multi-agent orchestration', chapter: 'Introduction', href: 'chapter-01.html#capabilities', kw: 'capabilities file shell git bash read write execute' },
  { num: '01', title: 'Multi-Agent Workflows', desc: 'Claude Code orchestrating teams of specialized subagents', chapter: 'Introduction', href: 'chapter-01.html#multi-agent', kw: 'multi agent workflow orchestration parallel subagent' },
  { num: '01', title: 'Installation', desc: 'npm install -g @anthropic-ai/claude-code — getting started', chapter: 'Introduction', href: 'chapter-01.html#installation', kw: 'install npm setup getting started api key' },
  { num: '01', title: 'Prerequisites', desc: 'Node.js, Anthropic API key, and basic terminal familiarity', chapter: 'Introduction', href: 'chapter-01.html#prerequisites', kw: 'prerequisites requirements node api key terminal' },

  // Chapter 02 — Context Engineering
  { num: '02', title: 'What is Context Engineering', desc: 'The discipline of managing what Claude knows and can see at any moment', chapter: 'Context Engineering', href: 'chapter-02.html#what-is-context', kw: 'context engineering manage information token window' },
  { num: '02', title: 'Context Sources', desc: 'CLAUDE.md, system prompts, conversation history, tool outputs, file reads', chapter: 'Context Engineering', href: 'chapter-02.html#context-sources', kw: 'context sources claude.md system prompt history files tools' },
  { num: '02', title: 'Context Degradation', desc: 'How context quality degrades over a long session — drift, loss, confusion', chapter: 'Context Engineering', href: 'chapter-02.html#degradation', kw: 'context degradation drift loss confused long session' },
  { num: '02', title: 'Four Context Strategies', desc: 'Write, Select, Compress, Isolate — four strategies to manage context', chapter: 'Context Engineering', href: 'chapter-02.html#strategies', kw: 'write select compress isolate context strategy management' },
  { num: '02', title: 'Persistent Memory Architecture', desc: 'Three-tier memory: project (CLAUDE.md), user (~/.claude), dynamic (hooks)', chapter: 'Context Engineering', href: 'chapter-02.html#persistent-memory', kw: 'persistent memory claude.md user project dynamic hooks tier' },
  { num: '02', title: 'Context Compression', desc: '/clear vs /compact — when to reset context vs summarize it', chapter: 'Context Engineering', href: 'chapter-02.html#compression', kw: 'compress compact clear reset context tokens save' },
  { num: '02', title: 'Context Isolation', desc: 'Using subagents to prevent context pollution between tasks', chapter: 'Context Engineering', href: 'chapter-02.html#isolation', kw: 'isolation subagent separate context pollution prevent' },
  { num: '02', title: 'System Prompt Design', desc: 'Writing effective CLAUDE.md files — the Goldilocks zone', chapter: 'Context Engineering', href: 'chapter-02.html#system-prompts', kw: 'system prompt design claude.md effective goldilocks zone' },

  // Chapter 03 — Claude Code Essentials
  { num: '03', title: 'Three Interface Modes', desc: 'Interactive REPL, non-interactive pipe mode, and SDK/API mode', chapter: 'Claude Code Essentials', href: 'chapter-03.html#modes', kw: 'interface modes repl interactive pipe sdk api' },
  { num: '03', title: '/init Command', desc: 'Initialize a project — generates CLAUDE.md with project context', chapter: 'Claude Code Essentials', href: 'chapter-03.html#init', kw: 'init initialize project claude.md generate setup' },
  { num: '03', title: 'Plan Mode', desc: 'Shift+Tab to enter read-only planning mode before implementation', chapter: 'Claude Code Essentials', href: 'chapter-03.html#plan-mode', kw: 'plan mode shift tab read only research spec' },
  { num: '03', title: 'Spec-Driven Development', desc: 'Using plan mode to generate a spec before writing any code', chapter: 'Claude Code Essentials', href: 'chapter-03.html#spec-driven', kw: 'spec driven development plan spec first code implementation' },
  { num: '03', title: 'Model Selection', desc: 'Opus vs Sonnet vs Haiku — choosing the right model for your task', chapter: 'Claude Code Essentials', href: 'chapter-03.html#model-selection', kw: 'model selection opus sonnet haiku claude choose' },
  { num: '03', title: 'Session Management', desc: '/clear, /compact, session history, and context control', chapter: 'Claude Code Essentials', href: 'chapter-03.html#sessions', kw: 'session management clear compact history context control' },
  { num: '03', title: 'Connecting MCP Tools', desc: 'claude mcp add — user scope vs project scope for tool servers', chapter: 'Claude Code Essentials', href: 'chapter-03.html#mcp-tools', kw: 'mcp tools connect add user project scope server' },

  // Chapter 04 — Essential Commands
  { num: '04', title: 'Slash Commands Reference', desc: 'Complete list: /init, /clear, /compact, /todo, /model, /mcp, /help', chapter: 'Essential Commands', href: 'chapter-04.html#slash-commands', kw: 'slash commands init clear compact todo model mcp help reference' },
  { num: '04', title: 'CLI Flags', desc: '--print, --model, --dangerously-skip-permissions, --no-stream flags', chapter: 'Essential Commands', href: 'chapter-04.html#cli-flags', kw: 'cli flags print model dangerously skip permissions stream' },
  { num: '04', title: 'Keyboard Shortcuts', desc: 'Escape, Ctrl+C, Shift+Tab, Ctrl+R — all keyboard shortcuts', chapter: 'Essential Commands', href: 'chapter-04.html#keyboard-shortcuts', kw: 'keyboard shortcuts escape ctrl shift tab' },
  { num: '04', title: 'Permission System', desc: 'Allow/deny rules in settings.json — controlling what Claude can do', chapter: 'Essential Commands', href: 'chapter-04.html#permissions', kw: 'permission system allow deny settings.json control bash write read' },
  { num: '04', title: 'Todo Lists', desc: '/todo command — Claude tracks tasks with TodoWrite tool internally', chapter: 'Essential Commands', href: 'chapter-04.html#todo-lists', kw: 'todo list tasks track progress todowrite internal' },
  { num: '04', title: 'Custom Commands', desc: '.claude/commands/ directory — create reusable slash commands', chapter: 'Essential Commands', href: 'chapter-04.html#custom-commands', kw: 'custom commands .claude commands directory slash reusable' },
  { num: '04', title: 'Hooks', desc: 'PreToolUse, PostToolUse, Stop, Notification hooks in settings.json', chapter: 'Essential Commands', href: 'chapter-04.html#hooks', kw: 'hooks pretooluse posttooluse stop notification settings.json shell' },

  // Chapter 05 — MCP
  { num: '05', title: 'What is MCP', desc: 'Model Context Protocol — standardized interface for external tool integration', chapter: 'MCP', href: 'chapter-05.html#what-is-mcp', kw: 'mcp model context protocol what is tool integration external' },
  { num: '05', title: 'MCP Architecture', desc: 'Client-server model: Claude Code (client) ↔ MCP Server ↔ External API', chapter: 'MCP', href: 'chapter-05.html#architecture', kw: 'mcp architecture client server external api diagram' },
  { num: '05', title: 'Transport Mechanisms', desc: 'stdio vs SSE transport — local vs remote MCP servers', chapter: 'MCP', href: 'chapter-05.html#transport', kw: 'transport stdio sse local remote server mcp' },
  { num: '05', title: 'Connecting MCP Servers', desc: 'claude mcp add — CLI commands to connect servers at user or project scope', chapter: 'MCP', href: 'chapter-05.html#connecting', kw: 'connect mcp server add cli user project scope' },
  { num: '05', title: 'Common MCP Servers', desc: 'GitHub, filesystem, Brave search, Postgres, Playwright MCP servers', chapter: 'MCP', href: 'chapter-05.html#common-servers', kw: 'common mcp servers github filesystem search postgres playwright' },
  { num: '05', title: 'Tool Schemas', desc: 'JSON schema definitions for MCP tools — how Claude understands tools', chapter: 'MCP', href: 'chapter-05.html#tool-schemas', kw: 'tool schema json mcp definition how works' },
  { num: '05', title: 'MCP Known Pitfalls', desc: 'Context pollution, round-trip inefficiency, shallow tool definitions', chapter: 'MCP', href: 'chapter-05.html#pitfalls', kw: 'mcp pitfalls context pollution inefficiency shallow tool' },

  // Chapter 06 — GitHub Integration
  { num: '06', title: 'GitHub MCP Setup', desc: 'Install GitHub MCP server with personal access token and required scopes', chapter: 'GitHub Integration', href: 'chapter-06.html#setup', kw: 'github mcp setup install token scopes auth' },
  { num: '06', title: 'PR Workflows', desc: 'Create pull requests from git diff with structured PR descriptions', chapter: 'GitHub Integration', href: 'chapter-06.html#pr-workflow', kw: 'pull request pr create workflow github diff description' },
  { num: '06', title: 'Automated Code Review', desc: 'Use @claude mentions in GitHub PRs to trigger automated review', chapter: 'GitHub Integration', href: 'chapter-06.html#code-review', kw: 'code review automated github claude mention pr comment' },
  { num: '06', title: 'Issue Management', desc: 'Triage bugs, create issues, and link them to PRs via GitHub MCP', chapter: 'GitHub Integration', href: 'chapter-06.html#issues', kw: 'issue management bug triage create link github' },
  { num: '06', title: 'GitHub Actions CI/CD', desc: 'Automate code review and test failure analysis in CI workflows', chapter: 'GitHub Integration', href: 'chapter-06.html#github-actions', kw: 'github actions cicd workflow automate test failure analysis' },
  { num: '06', title: 'Automation Security', desc: 'Token scope minimization and prompt injection protection in GitHub workflows', chapter: 'GitHub Integration', href: 'chapter-06.html#considerations', kw: 'automation security token scope prompt injection github workflow' },

  // Chapter 07 — Advanced Workflows
  { num: '07', title: 'Plan Mode (Advanced)', desc: 'Read-only research phase before implementation — spec-first development', chapter: 'Advanced Workflows', href: 'chapter-07.html#plan-mode', kw: 'plan mode advanced shift tab spec read only implementation' },
  { num: '07', title: 'Extended Thinking', desc: 'think / think hard / think harder / ultrathink — deep reasoning keywords', chapter: 'Advanced Workflows', href: 'chapter-07.html#deep-thinking', kw: 'extended thinking think hard ultrathink deep reason complex' },
  { num: '07', title: 'Git-First Development', desc: 'Always branch, commit checkpoints, atomic commits with Claude Code', chapter: 'Advanced Workflows', href: 'chapter-07.html#git-workflows', kw: 'git first branch commit checkpoint atomic workflow' },
  { num: '07', title: 'Parallel Worktrees', desc: 'Run multiple Claude Code instances simultaneously using git worktrees', chapter: 'Advanced Workflows', href: 'chapter-07.html#parallel-worktrees', kw: 'parallel worktrees multiple sessions git worktree simultaneous' },
  { num: '07', title: 'Spec-Driven Loop', desc: 'Plan → Spec → Review → Implement → Test — the complete workflow', chapter: 'Advanced Workflows', href: 'chapter-07.html#spec-workflow', kw: 'spec driven loop plan implement test review workflow' },

  // Chapter 08 — Subagents
  { num: '08', title: 'What Are Subagents', desc: 'Claude Code spawning child agents with isolated context windows for parallel work', chapter: 'Subagents', href: 'chapter-08.html#what-are-subagents', kw: 'subagents child agent isolated context parallel spawn' },
  { num: '08', title: 'Spawning Subagents', desc: 'Task tool — how Claude creates and dispatches subagents', chapter: 'Subagents', href: 'chapter-08.html#spawning-subagents', kw: 'spawn subagent task tool dispatch create parallel' },
  { num: '08', title: 'Subagents Context Flow', desc: 'How context passes from main agent to subagents and results flow back', chapter: 'Subagents', href: 'chapter-08.html#context-flow', kw: 'subagent context flow pass results synthesize main agent' },
  { num: '08', title: 'Prompting Subagents', desc: 'Narrow scope, explicit output format, file references for effective subagents', chapter: 'Subagents', href: 'chapter-08.html#prompting-subagents', kw: 'prompting subagent narrow scope output format file reference' },
  { num: '08', title: 'Meta Prompting', desc: 'Use Claude to write task descriptions for other Claude instances', chapter: 'Subagents', href: 'chapter-08.html#meta-prompting', kw: 'meta prompting claude write prompts for claude generate tasks' },
  { num: '08', title: 'Infinite Subagents', desc: 'Dynamic N-agent spawning pattern for batch operations on large codebases', chapter: 'Subagents', href: 'chapter-08.html#infinite-subagents', kw: 'infinite subagents batch dynamic spawn large codebase operations' },

  // Chapter 09 — Output Styles
  { num: '09', title: 'What Are Output Styles', desc: '/output-style command — control tone, format, verbosity of Claude responses', chapter: 'Output Styles', href: 'chapter-09.html#what-are-output-styles', kw: 'output style tone format verbosity control response' },
  { num: '09', title: 'Creating Custom Output Styles', desc: '/output-style new — launch setup agent to create a custom style', chapter: 'Output Styles', href: 'chapter-09.html#creating-styles', kw: 'create custom output style new command setup markdown' },
  { num: '09', title: 'Project-Level Output Styles', desc: '.claude/output-styles/ — shared team styles committed to the repository', chapter: 'Output Styles', href: 'chapter-09.html#project-styles', kw: 'project level output style team shared directory commit repo' },
  { num: '09', title: 'Status Line Customization', desc: 'Configure Claude Code status bar with model, tokens, cost variables', chapter: 'Output Styles', href: 'chapter-09.html#status-line', kw: 'status line customize statusLine model tokens cost settings' },
  { num: '09', title: 'Teams of Specialized Agents', desc: 'Architect, coder, reviewer, tester — specialized agent roles with output styles', chapter: 'Output Styles', href: 'chapter-09.html#specialized-agents', kw: 'specialized agents team roles architect coder reviewer tester' },

  // Chapter 10 — Agent Skills
  { num: '10', title: 'What Are Agent Skills', desc: 'Reusable custom slash commands stored as markdown files', chapter: 'Agent Skills', href: 'chapter-10.html#what-are-skills', kw: 'agent skills slash commands reusable markdown files custom' },
  { num: '10', title: 'Creating Skills', desc: '.claude/commands/*.md — file name becomes the slash command', chapter: 'Agent Skills', href: 'chapter-10.html#creating-skills', kw: 'create skill commands directory markdown slash command name' },
  { num: '10', title: 'Skills with Auxiliary Scripts', desc: 'Skills that invoke bash scripts for deterministic checks before Claude analysis', chapter: 'Agent Skills', href: 'chapter-10.html#auxiliary-scripts', kw: 'skill auxiliary script bash deterministic check analysis invoke' },
  { num: '10', title: 'Skills vs MCP', desc: 'When to use skills (workflow encoding) vs MCP (external live data APIs)', chapter: 'Agent Skills', href: 'chapter-10.html#skills-vs-mcp', kw: 'skills vs mcp comparison workflow external api live data' },
  { num: '10', title: 'Skills vs Subagents', desc: 'User-initiated skills vs agent-spawned subagents — control and parallelism', chapter: 'Agent Skills', href: 'chapter-10.html#skills-vs-subagents', kw: 'skills vs subagents user initiated agent spawned parallel control' },
  { num: '10', title: 'Skills Tradeoffs', desc: 'Pros: simple, git-tracked. Cons: no live data, no state persistence', chapter: 'Agent Skills', href: 'chapter-10.html#tradeoffs', kw: 'skills tradeoffs pros cons simple git no live data no state' },

  // Chapter 11 — Desktop
  { num: '11', title: 'Claude Code Desktop App', desc: 'Desktop app enabling background agents and session management', chapter: 'Desktop', href: 'chapter-11.html#desktop-app', kw: 'desktop app background agents session management ui' },
  { num: '11', title: 'Local vs Cloud Agents', desc: 'Local: your machine and filesystem. Cloud: Anthropic infra, always-on', chapter: 'Desktop', href: 'chapter-11.html#operating-modes', kw: 'local cloud agent mode operating anthropic infrastructure' },
  { num: '11', title: 'Background Agents', desc: 'Fire off a task, continue working, agent notifies on completion', chapter: 'Desktop', href: 'chapter-11.html#background-agents', kw: 'background agent fire task continue notify completion' },
  { num: '11', title: 'Git Worktrees', desc: 'Multiple simultaneous checkouts from same repo for parallel Claude sessions', chapter: 'Desktop', href: 'chapter-11.html#git-worktrees', kw: 'git worktree multiple checkout parallel session branch' },
  { num: '11', title: 'Merging Worktrees', desc: 'Complete work in worktree, merge branch, remove worktree — full flow', chapter: 'Desktop', href: 'chapter-11.html#merging', kw: 'merge worktree complete branch remove cleanup git' },
  { num: '11', title: 'Parallel Agent Orchestration', desc: 'Multiple local and cloud agents working on different parts simultaneously', chapter: 'Desktop', href: 'chapter-11.html#parallel-orchestration', kw: 'parallel orchestration multiple local cloud agents simultaneous' },
  { num: '11', title: 'Claude Code Mobile', desc: 'Mobile app for oversight and approval of background agent work', chapter: 'Desktop', href: 'chapter-11.html#mobile', kw: 'mobile ios android oversight approve background agent' },

  // Chapter 12 — Deep Agents
  { num: '12', title: 'Deep vs Shallow Agents', desc: 'Deep: long-running, self-directing. Shallow: one-shot question answerers', chapter: 'Deep Agents', href: 'chapter-12.html#taxonomy', kw: 'deep shallow agent taxonomy long running self directing' },
  { num: '12', title: 'Claude Code TODO Internals', desc: 'How Claude maintains an internal todo list to track multi-step tasks', chapter: 'Deep Agents', href: 'chapter-12.html#todo-internals', kw: 'todo internals task list track progress decompose steps' },
  { num: '12', title: 'Hierarchical Delegation', desc: 'Orchestrator → coordinators → workers — tree of agents pattern', chapter: 'Deep Agents', href: 'chapter-12.html#hierarchical-delegation', kw: 'hierarchical delegation orchestrator coordinator worker tree agents' },
  { num: '12', title: 'Deep Agent Context Flow', desc: 'Context passes downward (task) and upward (results) through agent hierarchy', chapter: 'Deep Agents', href: 'chapter-12.html#context-flow-deep', kw: 'deep agent context flow downward upward hierarchy pass results' },
  { num: '12', title: 'File System as Agent Memory', desc: 'Agents use files as persistent memory — CLAUDE.md as cross-session state', chapter: 'Deep Agents', href: 'chapter-12.html#filesystem', kw: 'file system memory persistent agent claude.md cross session state' },

  // Chapter 13 — Security
  { num: '13', title: 'AI Code Security Quality', desc: 'AI-generated code contains same vulnerabilities as human code — review required', chapter: 'Security', href: 'chapter-13.html#ai-code-quality', kw: 'ai code security quality vulnerability review human generated' },
  { num: '13', title: 'OWASP Top 10 in AI Context', desc: 'SQL injection, XSS, broken auth, insecure deps — how AI generates each risk', chapter: 'Security', href: 'chapter-13.html#owasp-awareness', kw: 'owasp top 10 sql injection xss broken auth vulnerability ai' },
  { num: '13', title: 'Prompt Injection', desc: 'Malicious instructions in files that Claude reads — a real attack vector', chapter: 'Security', href: 'chapter-13.html#prompt-injection', kw: 'prompt injection attack malicious file instructions read security' },
  { num: '13', title: 'Permission Minimization', desc: 'Allow only what the task needs — task-specific permission profiles', chapter: 'Security', href: 'chapter-13.html#permission-minimization', kw: 'permission minimize least privilege allow deny task specific profile' },
  { num: '13', title: 'Secrets Management', desc: 'Never paste API keys into Claude — use env vars, deny .env access', chapter: 'Security', href: 'chapter-13.html#secrets-management', kw: 'secrets api key token password env var deny rotate' },
  { num: '13', title: 'Security Review Practices', desc: '8-step checklist: SAST, input validation, auth checks, CVE audit', chapter: 'Security', href: 'chapter-13.html#review-practices', kw: 'security review checklist sast gosec semgrep audit cve validation' },
  { num: '13', title: 'Supply Chain Security', desc: 'AI may suggest malicious typosquatting packages — always verify', chapter: 'Security', href: 'chapter-13.html#supply-chain', kw: 'supply chain package typosquatting verify npm go audit install' },
];

/* ── Command Palette ────────────────────────────────────── */
function getPageSections() {
  return Array.from(document.querySelectorAll('.section[id], .sub[id]'))
    .map(el => {
      const h = el.querySelector('h2, h3');
      return h ? { num: '#', title: h.textContent.replace(/[¶#]/g, '').trim(), desc: 'Current page', chapter: 'This Page', href: '#' + el.id } : null;
    })
    .filter(Boolean);
}

let selectedIdx = 0;

function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(re, '<span class="cmd-match">$1</span>');
}

function fuzzyMatch(item, query) {
  const q = query.toLowerCase();
  const searchable = (item.title + ' ' + item.desc + ' ' + item.chapter + ' ' + (item.kw || '')).toLowerCase();
  // All query words must appear somewhere
  return q.split(/\s+/).every(word => searchable.includes(word));
}

function renderCmdResults(q) {
  const el = document.getElementById('cmd-results');
  if (!el) return;

  const query = q.trim().toLowerCase();
  const pageSections = getPageSections();

  let results;
  if (!query) {
    results = [
      { group: 'On This Page', items: pageSections },
      { group: 'All Chapters', items: SEARCH_INDEX.slice(0, 12) },
    ];
  } else {
    const pageMatches = pageSections.filter(i => fuzzyMatch(i, query));
    const indexMatches = SEARCH_INDEX.filter(i => fuzzyMatch(i, query));
    results = [];
    if (pageMatches.length) results.push({ group: 'On This Page', items: pageMatches });
    if (indexMatches.length) results.push({ group: 'Documentation', items: indexMatches });
  }

  const allItems = results.flatMap(g => g.items);
  selectedIdx = 0;

  if (!allItems.length) {
    el.innerHTML = '<p style="color:var(--text-3);font-size:0.84rem;padding:20px;text-align:center">No results for <strong style="color:var(--text)">"' + q + '"</strong></p>';
    return;
  }

  let html = '';
  let globalIdx = 0;
  results.forEach(group => {
    html += `<div class="cmd-group-lbl">${group.group}</div>`;
    group.items.forEach(item => {
      const titleHl = highlight(item.title, q);
      const descHl = highlight(item.desc, q);
      html += `<a class="cmd-item${globalIdx === 0 ? ' sel' : ''}" href="${item.href}">
        <span class="cmd-icon">${item.num}</span>
        <span class="cmd-item-body">
          <span class="cmd-title">${titleHl}</span>
          <span class="cmd-desc">${descHl} · ${item.chapter}</span>
        </span>
      </a>`;
      globalIdx++;
    });
  });

  el.innerHTML = html;
  el.querySelectorAll('.cmd-item').forEach((node, i) => {
    node.addEventListener('mouseenter', () => { selectedIdx = i; updateSel(); });
  });
}

function updateSel() {
  document.querySelectorAll('.cmd-item').forEach((el, i) => el.classList.toggle('sel', i === selectedIdx));
}

function openCmd() {
  const overlay = document.getElementById('cmd-overlay');
  const input = document.getElementById('cmd-input');
  if (!overlay) return;
  overlay.classList.add('open');
  if (input) { input.value = ''; input.focus(); renderCmdResults(''); }
}
function closeCmd() { document.getElementById('cmd-overlay')?.classList.remove('open'); }

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('cmd-overlay')?.classList.contains('open') ? closeCmd() : openCmd();
    return;
  }
  if (e.key === 'Escape') { closeCmd(); return; }

  const overlay = document.getElementById('cmd-overlay');
  if (!overlay?.classList.contains('open')) return;

  const items = document.querySelectorAll('.cmd-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
    updateSel(); items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIdx = Math.max(selectedIdx - 1, 0);
    updateSel(); items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    const sel = document.querySelector('.cmd-item.sel');
    if (sel) { sel.click(); closeCmd(); }
  }
});

document.querySelector('.search-trigger')?.addEventListener('click', openCmd);
document.getElementById('cmd-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('cmd-overlay')) closeCmd();
});

/* ── Scroll-reveal Animations ───────────────────────────── */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, _) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  function markReveal() {
    /* Feature grid cards — staggered */
    document.querySelectorAll('.feature-grid .feature-card').forEach((el, i) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 60) + 'ms';
      io.observe(el);
    });
    /* Stat cards — staggered */
    document.querySelectorAll('.stat-card, .stats .stat-card').forEach((el, i) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 80) + 'ms';
      io.observe(el);
    });
    /* Sections */
    document.querySelectorAll('.section, .sub').forEach(el => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      io.observe(el);
    });
    /* Chapter cards on index */
    document.querySelectorAll('.ch-card').forEach((el, i) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 40) + 'ms';
      io.observe(el);
    });
    /* Callouts */
    document.querySelectorAll('.callout').forEach((el, i) => {
      if (el.classList.contains('reveal-left')) return;
      el.classList.add('reveal-left');
      el.style.transitionDelay = (i * 50) + 'ms';
      io.observe(el);
    });
    /* Mech steps */
    document.querySelectorAll('.mech-step').forEach((el, i) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 100) + 'ms';
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markReveal);
  } else {
    markReveal();
  }
})();

/* ── SVG Dot Grid in Page Header ───────────────────────── */
(function injectHeaderDots() {
  const ph = document.querySelector('.page-header');
  if (!ph) return;
  const dot = document.createElement('div');
  dot.setAttribute('aria-hidden', 'true');
  dot.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;opacity:0.045';
  dot.innerHTML = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="dp" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
    </pattern></defs>
    <rect width="100%" height="100%" fill="url(#dp)" style="color:var(--accent)"/>
  </svg>`;
  ph.insertBefore(dot, ph.firstChild);
  /* Note: .page-illus uses position:absolute — do NOT override children's position */
})();

/* ── SVG Mesh Decoration in Hero ────────────────────────── */
(function injectHeroMesh() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const mesh = document.createElement('div');
  mesh.className = 'hero-mesh';
  mesh.innerHTML = `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="rg1" cx="70%" cy="30%">
        <stop offset="0%" stop-color="#a78bfa"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <radialGradient id="rg2" cx="20%" cy="80%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <circle cx="560" cy="120" r="260" fill="url(#rg1)" opacity="0.6"/>
    <circle cx="160" cy="320" r="200" fill="url(#rg2)" opacity="0.5"/>
    <line x1="0" y1="0" x2="800" y2="400" stroke="#a78bfa" stroke-width="0.5" opacity="0.3"/>
    <line x1="800" y1="0" x2="0" y2="400" stroke="#60a5fa" stroke-width="0.5" opacity="0.3"/>
    <line x1="400" y1="0" x2="400" y2="400" stroke="#a78bfa" stroke-width="0.5" opacity="0.2"/>
    <line x1="0" y1="200" x2="800" y2="200" stroke="#60a5fa" stroke-width="0.5" opacity="0.2"/>
    <circle cx="560" cy="120" r="4" fill="#a78bfa" opacity="0.6"/>
    <circle cx="160" cy="320" r="3" fill="#60a5fa" opacity="0.6"/>
    <circle cx="400" cy="200" r="3" fill="#34d399" opacity="0.5"/>
    <circle cx="240" cy="80"  r="2" fill="#a78bfa" opacity="0.4"/>
    <circle cx="680" cy="280" r="2" fill="#60a5fa" opacity="0.4"/>
  </svg>`;
  hero.insertBefore(mesh, hero.firstChild);
})();
document.getElementById('cmd-input')?.addEventListener('input', e => renderCmdResults(e.target.value));

/* ── Initialize Lucide Icons Globally ────────────────────────── */
if (window.lucide) {
  window.lucide.createIcons();
}
