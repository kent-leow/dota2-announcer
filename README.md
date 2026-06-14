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

Automatically deployed to Vercel on push to `main` when files in `landing/` change (via `.github/workflows/deploy-landing.yml`).

**Required GitHub Secrets:**

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Run `vercel link` in `landing/` → `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same as above |

## Releasing

The release pipeline (`.github/workflows/release-app.yml`) builds the Electron app for Windows and macOS and publishes installers to GitHub Releases.

### How to Publish a Release

```bash
git tag v0.2.0
git push origin v0.2.0
```

The pipeline will:
1. Build the app on Windows (`windows-latest`) and macOS (`macos-latest`)
2. Create a GitHub Release with the tag name
3. Upload `.exe` and `.dmg` installers as release assets

No additional secrets required — uses the auto-provided `GITHUB_TOKEN`.
