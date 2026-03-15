# Contributing to Skills Manager

Thanks for your interest in contributing!

## Getting Started

1. Fork the repo and clone your fork
2. Install dependencies: `npm install`
3. Create a branch: `git checkout -b my-feature`
4. Make your changes, then run the app to verify: `npm run dev:desktop`
5. Commit and push your branch, then open a pull request

## Project Structure

```
apps/
  desktop/   # Electron + Vite + React desktop app
  web/       # Next.js landing page
```

## Development

```bash
npm install        # install all workspace dependencies
npm run dev        # run all apps
npm run dev:desktop  # run only the desktop app
npm run dev:web    # run only the landing page
```

## Adding Support for a New Agent

1. Add the agent type to [apps/desktop/src/types/index.ts](apps/desktop/src/types/index.ts)
2. Implement skill discovery and write logic in [apps/desktop/electron/main.ts](apps/desktop/electron/main.ts)
3. Add an icon or logo to [apps/desktop/src/components/ToolIcon.tsx](apps/desktop/src/components/ToolIcon.tsx)
4. Update the supported agents list in [README.md](README.md)

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Describe what you changed and why in the PR description
- If adding a new agent, include a brief note on where its skills are stored on each platform

## Reporting Bugs

Open an issue and include:
- Your OS and version
- Which agent(s) are affected
- Steps to reproduce
- What you expected vs. what happened

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
