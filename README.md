# Dota 2 Announcer

Desktop companion app that provides real-time audio announcements for Dota 2 game events (rune spawns, neutral camps, siege creeps, etc.) via Game State Integration.

## Structure

| Directory | Purpose |
|-----------|---------|
| `application/` | Electron desktop app (TypeScript, Vite, React) |
| `landing/` | Marketing/download landing page (React, Vite, Tailwind) |
| `scripts/` | Monorepo utility scripts |

## Quick Start

All commands run from the project root:

```bash
npm run dev            # Run desktop app (Electron)
npm run dev:landing    # Run landing page dev server
npm run build          # Build desktop app
npm run build:landing  # Build landing page
npm run test           # Run app tests
npm run test:landing   # Run landing tests
npm run test:all       # Run all tests
npm run release -- 0.2.0  # Bump version, tag, push → triggers release pipeline
```

## Application

See [application/README.md](application/README.md) for setup, development, and build instructions.

## Landing

Marketing and download page deployed to Vercel.

### Local Development

```bash
npm run dev:landing
```

Opens at `http://localhost:5173`.

### Deployment

Vercel is connected to this repo via its GitHub integration. Deploys automatically on every push to `main` — no secrets or workflows needed.

- Root Directory configured in Vercel: `landing`
- Framework: Vite
- Pushes to `main` that touch `landing/` → auto-deploy to production
- Pull requests → preview deployments

## Releasing the App

The release pipeline (`.github/workflows/release-app.yml`) builds the Electron app for Windows and macOS and publishes installers to GitHub Releases.

### How to Publish a New App Version

```bash
npm run release -- 0.2.0
```

This single command:
1. Updates `application/package.json` version to `0.2.0`
2. Commits the version bump
3. Creates git tag `v0.2.0`
4. Pushes commit + tag to origin

The pipeline then:
1. Builds the app on Windows (`windows-latest`) and macOS (`macos-latest`)
2. Creates a GitHub Release with the tag name
3. Uploads `.exe` and `.dmg` installers as release assets

No additional secrets required — uses the auto-provided `GITHUB_TOKEN`.

### Website vs App — What Triggers What?

| You do this | Result |
|-------------|--------|
| Push to `main` | Website auto-deploys via Vercel (if `landing/` changed) |
| `npm run release -- x.y.z` | App builds + GitHub Release created with installers |
| Push to `main` (only `application/` changes) | Nothing — no release until you run the release command |

The website and app releases are fully independent.
