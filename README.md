# Dota 2 Announcer

Desktop companion app that provides real-time audio announcements for Dota 2 game events (rune spawns, neutral camps, siege creeps, etc.) via Game State Integration.

## Structure

| Directory | Purpose |
|-----------|---------|
| `application/` | Electron desktop app (TypeScript, Vite, React) |
| `landing/` | Marketing/download landing page (React, Vite, Tailwind) |

## Application

See [application/README.md](application/README.md) for setup, development, and build instructions.

## Landing

Marketing and download page deployed to Vercel.

### Local Development

```bash
cd landing
npm install
npm run dev
```

Opens at `http://localhost:5173`. Build with `npm run build`.

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
# 1. Bump version in application/package.json
# 2. Commit the change
# 3. Tag and push
git tag v0.2.0
git push origin v0.2.0
```

The pipeline will:
1. Build the app on Windows (`windows-latest`) and macOS (`macos-latest`)
2. Create a GitHub Release with the tag name
3. Upload `.exe` and `.dmg` installers as release assets

No additional secrets required — uses the auto-provided `GITHUB_TOKEN`.

### Website vs App — What Triggers What?

| You do this | Result |
|-------------|--------|
| Push to `main` | Website auto-deploys via Vercel (if `landing/` changed) |
| Push a `v*` tag | App builds + GitHub Release created with installers |
| Push to `main` (only `application/` changes) | Nothing happens — no release until you tag |

The website and app releases are fully independent.
