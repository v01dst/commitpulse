<div align="center">

# ⚡ CommitPulse

**Never break the streak.**

A VS Code extension that puts your **live git commit streak** right in the status bar.

[![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-007ACC?style=flat-square&logo=visualstudiocode)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

*Ship something every day. CommitPulse keeps count.*

</div>

---

## 🤔 Why?

Green squares on GitHub are fun, but they live on a website you check *after* the fact.
CommitPulse lives **where you actually code** — it watches your repo and answers one question in real time:

> *"Have I committed today?"*

If the answer is no, your streak bar tells you before the day ends. Small nudge, huge compounding effect.

## ✨ Features

| Feature | What it does |
|---|---|
| 🔥 **Live streak badge** | Status bar shows `🔥 12-day streak (3 today)` — updates the moment you commit |
| ⏳ **Today check** | No commit yet today? The bar flips to `⏳ streak: 12 — commit today to keep it` |
| 📊 **Activity panel** | Click the badge for today's commits, recent commits, current + best streak |
| 🖥️ **Any repo, zero config** | Auto-detects the workspace git repo. No tokens, no login, no network |
| 🪶 **Featherweight** | Pure `git` under the hood. No daemon, no dependencies at runtime |
| ⌨️ **Plays nice** | File watchers debounce git events — no CPU spikes while you work |

## 📸 Preview

```
 ┌──────────────────────────────────────────┐
 │  🔥 12-day streak (3 today)        ← CommitPulse badge
 │  main.ts — your editor...                 │
 └──────────────────────────────────────────┘
```

Click the badge → Activity panel:

```
Current streak 🔥: 12 days
Best streak: 14 days
Today: 3 commits ✅

Today's commits:
  a1b2c3d feat: add login validation (you)
  9f8e7d6 fix: token refresh edge case (you)

Recent commits:
  4d5e6f7 refactor: extract rate limiter (you)
  ...
```

## 🚀 Install

**From the Marketplace** (once published):

<p align="center"><kbd>Ctrl</kbd>+<kbd>P</kbd> → <code>ext install v01dst.commitpulse</code></p>

**From source**:

```bash
git clone https://github.com/v01dst/commitpulse
cd commitpulse
npm install
npm run compile
```

Then in VS Code: **Run and Debug → Launch Extension** (F5), or package manually:

```bash
npx @vscode/vsce package
code --install-extension commitpulse-0.1.0.vsix
```

## ⌨️ Commands

| Command | Action |
|---|---|
| `CommitPulse: View Activity` | Open the activity panel |
| `CommitPulse: Refresh` | Force a streak re-scan |

Click the status bar badge anytime for the shortcut.

## ⚙️ Settings

| Setting | Default | Description |
|---|---|---|
| `commitpulse.emojiMode` | `emoji` | `emoji` → 🔥 streak badge · `text` → plain, emoji-free badge |

## 🧠 How it works

1. Runs `git log --all --author-date-order` on your workspace repo (last 400 days)
2. Buckets commits by day, walks backwards from today for the streak
3. Shows the result in the status bar
4. File watchers on `.git/HEAD` and `.git/refs/**` trigger a debounced refresh — commit, see it update **instantly**

No telemetry. No network. Your data never leaves your machine.

## 🗺️ Roadmap

- [ ] Per-author filtering (multi-dev repos)
- [ ] Streak history graph (last 90 days)
- [ ] Optional goal reminders ("3 hours left today…")
- [ ] Multi-root workspace support
- [ ] Marketplace publishing

## 🤝 Contributing

PRs welcome — small, focused diffs preferred.

```bash
git clone https://github.com/v01dst/commitpulse
npm install
npm run compile
```

Open issues for bugs or ideas: [issues](https://github.com/v01dst/commitpulse/issues)

## 📄 License

[MIT](./LICENSE) © v01dst

---

<div align="center">

### 💬 Questions, ideas, or just want to say hi?

**Discord: `9p.1`**

⭐ Star it if it keeps your streak alive.

</div>
