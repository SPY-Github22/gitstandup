# GitStandup ⏱️📝

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-emerald?style=for-the-badge&logo=github)](https://spy-github22.github.io/gitstandup/)
[![CI & Deployment](https://github.com/SPY-Github22/gitstandup/actions/workflows/ci.yml/badge.svg)](https://github.com/SPY-Github22/gitstandup/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: 0 Vulnerabilities](https://img.shields.io/badge/Security-0%20Vulnerabilities-brightgreen.svg)](https://github.com/SPY-Github22/gitstandup)

> **The Zero-Cloud Git Commit to Daily Standup Synthesizer**  
> *Transform scattered git commits, branch activity, and pull requests across local repositories into clean, formatted async standup updates (Yesterday / Today / Blockers) in one click.*

🌐 **Live Web App**: [https://spy-github22.github.io/gitstandup/](https://spy-github22.github.io/gitstandup/)

---

## 🚀 The Daily Friction It Solves

Every morning or end-of-day check-in, software engineers spend 5 to 10 minutes trying to remember:
1. *"What did I actually code yesterday across our 3 different backend and frontend repos?"*
2. Running `git log --since="yesterday"` across directories and manually deciphering 15 commits.
3. Rewriting cryptic commit messages (`fix(auth): css bug #2`, `feat: wip button`) into polished, professional update bullets for team standups in Slack, Discord, Jira, or Teams.

**GitStandup** eliminates this repetitive daily chore. Paste your git log or select a timeframe, and it instantly synthesizes a structured standup report ready to copy to your clipboard.

---

## 🔒 Security Architecture: Zero-Cloud Privacy Guarantee

Engineers work with proprietary corporate codebases and confidential ticket numbers. GitStandup enforces strict security boundaries:

- **Strict Content Security Policy (CSP)**:
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; font-src 'self' data:; object-src 'none'; base-uri 'self';
  ```
  `connect-src 'none'` cryptographically blocks the browser engine from making any outbound HTTP or WebSocket network calls.
- **100% In-Memory Processing**: Zero git commit messages, branch names, authors, or ticket identifiers ever touch disk or leave your device.
- **No Third-Party Analytics**: No Google Analytics, no telemetry beacons, no external CDNs.

---

## ✨ Features

- **🔍 Multi-Format Git Log Parser**:
  - Handles `git log --oneline` (`a1b2c3d feat(auth): add OAuth2 provider [ENG-200]`).
  - Handles piped formats (`git log --pretty=format:"%h|%an|%ad|%s"`).
  - Handles standard multiline verbose `git log` output.
  - Automatically identifies multi-repo prefixes (e.g., `[backend-api]`, `[web-ui]`).
- **🧠 Smart Deduplication & Ticket Grouping**:
  - Groups multiple iterative commits touching the same Jira/Linear ticket (`ENG-200`, `#456`) into a cohesive single bullet item.
- **⏱️ Flexible Timeframe Filtering**:
  - Filter by **Today**, **Yesterday**, **Last 7 Days**, or **All** with one click.
- **📋 Multi-Platform 1-Click Exporters**:
  - **Slack / Discord**: Formatted with bold bullet headers and inline code tickets.
  - **Markdown**: Formatted with GitHub/Notion markdown headings and checkboxes.
  - **Jira / Confluence**: Formatted using Jira wiki markup syntax (`h3. Yesterday / Done`).
  - **Plain Text / Email**: Clean minimalist bullet layout.
- **⚠️ Blocker & Dependency Manager**:
  - Auto-flags commits marked with `blocked by`, `wip: failing`, or `[blocker]`.
  - Add and track manual blockers with 1-click resolution toggles.

---

## ⚡ Quick Start: 3-Second Standup Generation

Run this single command in your repository terminal:
```bash
git log --since="yesterday" --pretty=format:"%h|%an|%ad|%s"
```

Paste the output into [GitStandup](https://spy-github22.github.io/gitstandup/), choose **Slack** or **Markdown**, and click **Copy Standup**!

---

## 🧪 Verification & Testing

GitStandup is built with strict engineering standards:
```bash
# Run unit test suite
npm test

# Typecheck TypeScript codebase
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## 📄 License

MIT © [SPY-Github22](https://github.com/SPY-Github22)
