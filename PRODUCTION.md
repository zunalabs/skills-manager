# Production plan

## Analytics

### Website

- Keep Vercel Web Analytics for anonymous page, referrer, country, operating system, browser, and device aggregates.
- Keep the download event sent to the private Discord workspace. It contains only the selected operating system and the country code supplied by Vercel.
- Use GitHub release asset counts as the public download total.
- Do not add email addresses, IP addresses, full user-agent strings, or persistent identifiers to download events.

Set these variables in the production website environment:

| Variable | Purpose |
| --- | --- |
| `DISCORD_WEBHOOK_URL` | Receives the minimal download and feedback events in the private Discord workspace. |
| `GITHUB_TOKEN` | Raises the GitHub API limit used to read release download totals. |

Vercel Web Analytics is enabled by the existing `@vercel/analytics` integration and does not need a public browser key.

### Desktop

Use Aptabase for privacy-focused desktop events. Anonymous telemetry is included in the desktop app and documented in the Privacy page.

Approved event schema:

| Event | Properties |
| --- | --- |
| `app_opened` | app version, operating system, architecture |
| `scan_completed` | duration bucket, connected-agent count bucket, skill-count bucket |
| `install_completed` | source type, target agent, success |
| `copy_completed` | source agent, target agent, success |
| `discover_opened` | app version |
| `feedback_submitted` | category, whether a rating was included |

Never send skill names or contents, file paths, repository URLs, GitHub tokens, feedback text, email addresses, IP addresses, or a persistent device identifier.

## macOS

The desktop code supports macOS. Public distribution requires Apple signing and notarization so Gatekeeper accepts the app.

1. Join the Apple Developer Program.
2. Create and export a Developer ID Application certificate as a password-protected `.p12` file.
3. Add the certificate as the `MAC_CSC_LINK` GitHub secret and its password as `MAC_CSC_KEY_PASSWORD`.
4. Add `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` repository secrets.
5. Run the **Build macOS release candidate** workflow manually.
6. Test both `arm64` and `x64` DMGs on clean Macs.
7. Verify signing with `codesign`, Gatekeeper with `spctl`, and the notarization ticket with `xcrun stapler validate`.
8. Add the verified artifacts to the tagged release and enable the Mac download on the website.

The standard tag workflow continues to publish Windows and Linux while the Mac release candidate is being validated.

## Release checks

- Desktop type check and unit tests pass.
- Website type check and production build pass with the development server stopped.
- Feedback works from both website and desktop.
- Windows installer and Linux AppImage launch on clean machines.
- Privacy and Terms match the exact analytics enabled in production.
- Release notes match the shipped agent paths and supported operating systems.
- Download a Windows and Linux build from the production website and confirm the private Discord event contains only platform and country code.
