# Skills Manager

A universal desktop app for managing AI agent skills across all major coding agents.

Windows and Linux are available now. A signed and notarized macOS build is in preparation.

## Apps

| App | Description |
|-----|-------------|
| [`apps/desktop`](./apps/desktop) | Electron desktop app |
| [`apps/web`](./apps/web) | Landing page (Next.js) |

## Supported Agents

- Claude Code
- Cursor
- Gemini CLI
- Antigravity CLI
- Windsurf
- Devin Desktop
- GitHub Copilot
- Goose
- Codex
- OpenCode
- Kilo Code
- Trae

## Features

- Browse and manage skills across all installed agents
- Install skills from any GitHub repo
- Copy skills between agents
- Delete skills
- Send feedback from the desktop app

Anonymous product analytics measure feature use and reliability. They never include skill content, file paths, repository URLs, feedback text, email, or tokens.

## Support

Skills Manager is free and open source. You can support continued development through [GitHub Sponsors](https://github.com/sponsors/evergreenx).

Production and macOS release preparation are documented in [`PRODUCTION.md`](./PRODUCTION.md).

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
