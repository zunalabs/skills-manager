# Skills Manager

A universal desktop app for managing AI agent skills across all major coding agents.

## Apps

| App | Description |
|-----|-------------|
| [`apps/desktop`](./apps/desktop) | Electron desktop app |
| [`apps/web`](./apps/web) | Landing page (Next.js) |

## Supported Agents

- Claude Code
- Cursor
- Gemini CLI
- Antigravity
- Windsurf
- GitHub Copilot
- Goose
- Codex
- OpenCode
- Kilo Code
- Trae

## Features

- Browse and manage skills across all installed agents
- Enable / disable skills
- Install skills from any GitHub repo
- Copy skills between agents
- Delete skills

## Development

```bash
# Install dependencies
npm install

# Run everything
npm run dev

# Run only the desktop app
npm run dev:desktop

# Run only the landing page
npm run dev:web
```

## Stack

- **Desktop** — Electron + Vite + React + TypeScript + Tailwind CSS
- **Web** — Next.js 14 + TypeScript + Tailwind CSS
- **Monorepo** — Turborepo + npm workspaces
