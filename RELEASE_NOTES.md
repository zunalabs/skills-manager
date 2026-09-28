# Release notes

## 0.2.0 — Desktop redesign and current agent support

### Interface

- Redesigned the desktop shell, navigation, skills sidebar, settings panel, and GitHub installation flow.
- Added complete light-mode styling and a consistent black-and-white brand mark across both themes.
- Simplified repeated headings and removed secondary labels that did not help navigation.
- Moved the skills-sidebar control into the header so it remains available when the sidebar is hidden.
- Replaced the previous accent styling with a neutral black-and-white system and cleaner system typography.
- Replaced the operating system menu and title frame with an integrated application menu and window controls.
- Added in-app feedback with an optional rating and clear data disclosure.
- Added direct project sponsorship and creator links.
- Added anonymous Aptabase product analytics with a strict event/property allowlist.
- Added Privacy and Terms pages for the website and desktop Help menu.
- Framed the working area as a rounded surface beside the main navigation.
- Removed the universal enable/disable switch because standalone Agent Skills do not share one portable disabled state.

### Agent compatibility

- Added Antigravity CLI support at `~/.gemini/antigravity-cli/skills`.
- Added Antigravity 2.0 and previous Antigravity directories as compatibility locations.
- Kept Gemini CLI support for enterprise, API-key, and existing installations.
- Updated Codex to use the Agent Skills standard at `~/.agents/skills`, while continuing to scan `~/.codex/skills`.
- Updated Kilo Code to use `~/.kilo/skills`, while continuing to scan the previous `~/.kilocode/skills` location.
- Added Devin Desktop at `~/.config/devin/skills` and retained Windsurf support.
- Skills found in both current and legacy directories are combined without duplicate names.

### Website and release preparation

- Updated the website to match the current desktop interface, supported agents, and Windows/Linux availability.
- Added minimal download measurement that reports only the selected operating system and Vercel country code to the project's private Discord workspace.
- Updated the Privacy page to describe website analytics, download measurement, and the desktop app's current telemetry status.
- Prepared native macOS window behavior and a workflow for signed, notarized DMG and ZIP release candidates for Intel and Apple silicon.
- Added a separate manual macOS release workflow so Windows and Linux publishing remains unchanged while Mac builds are tested.

### Upgrade behavior

Existing skill folders remain in place. Skills Manager reads supported legacy locations and installs new skills into each agent's current primary directory.

Skills hidden by an older Skills Manager release in an adjacent `_disabled` directory are restored automatically when no active folder with the same name exists.
