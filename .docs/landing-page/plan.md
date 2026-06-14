# Landing Page for Dota 2 Announcer

## Summary
Build a React-based marketing and download landing page for the Dota 2 Announcer desktop app. The page promotes all app features (real-time voice announcements, in-game overlay, configurable events, TTS controls, hotkeys, system tray), embeds the official Dota 2 page video for gameplay showcase, and provides download links for Windows and macOS. Includes two GitHub Actions pipelines: one to auto-deploy the landing page to Vercel on push, and one to build and publish Electron app releases (Windows + macOS) on version tag push.

## Scope
**In scope**
- Single-page React application under `landing/` directory
- Dota 2 theme matching the desktop app (dark bg `#0d0d0d`, gold accents `#c9a83e`, grey text `#a0a0b0`)
- Hero section with app title, tagline, and embedded Dota 2 official `<video>` element
- Features section promoting: voice announcements, in-game overlay (notification + persistent modes), configurable game events (12 built-in events), TTS customisation (voice, rate, volume), global hotkeys, system tray integration, Game State Integration auto-setup
- Download section with links for Windows (.exe) and macOS (.dmg) from GitHub Releases
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS for styling consistency with the desktop app
- GitHub Actions workflow: deploy landing page to Vercel on push to main (changes in `landing/`)
- GitHub Actions workflow: build Electron app for Windows and macOS, create GitHub Release with assets on version tag push (`v*`)
- Update root `README.md` with landing page section (dev instructions, Vercel deploy) and release workflow section (how to tag and publish)

**Out of scope**
- Backend / API
- User accounts or authentication
- Analytics or tracking setup
- Custom domain configuration (user manages this in Vercel dashboard)
- Blog or changelog section
- Internationalization

## Acceptance Criteria

| **AC1** | Project builds and deploys to Vercel |
|---------|--------------------------------------|
| Given | The `landing/` directory contains a React + Vite project with Vercel config |
| When  | Code is pushed to the main branch |
| Then  | Vercel automatically builds and deploys the site without errors |

| **AC2** | Theme matches desktop app |
|---------|--------------------------|
| Given | The landing page is loaded in a browser |
| When  | The user views the page |
| Then  | Background is `#0d0d0d`, primary accent is `#c9a83e` gold, text is `#a0a0b0` grey, and fonts match the desktop app |

| **AC3** | Hero section with video showcase |
|---------|----------------------------------|
| Given | The landing page hero section is visible |
| When  | The user scrolls to or lands on the page |
| Then  | An embedded `<video>` element sourced from the official Dota 2 page plays (autoplay muted loop) with the app title and tagline overlaid |

| **AC4** | All features promoted |
|---------|----------------------|
| Given | The features section is visible |
| When  | The user scrolls to the features area |
| Then  | All key features are listed with icons/descriptions: real-time voice announcements, dual overlay modes, 12 configurable game events, TTS customisation, global hotkeys, system tray, and GSI auto-setup |

| **AC5** | Download links point to GitHub Releases |
|---------|------------------------------------------|
| Given | The download section is visible |
| When  | The user clicks a download button |
| Then  | The browser navigates to `https://github.com/kent-leow/dota2-announcer/releases/latest` — a single "Download" CTA linking to the latest release page (assets will be published separately) |

| **AC6** | Responsive layout |
|---------|-------------------|
| Given | The landing page is opened on mobile (320px), tablet (768px), and desktop (1280px) viewports |
| When  | The page renders |
| Then  | Layout adapts without horizontal overflow, text remains readable, and interactive elements are accessible |

| **AC7** | Video element uses Dota 2 official source |
|---------|-------------------------------------------|
| Given | The hero video is rendered |
| When  | The page loads |
| Then  | The `<video>` element has two `<source>` children: WebM (`cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_webm.webm`) and MP4 (`cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_02.mp4`) |

| **AC8** | Landing page deploys via GitHub Actions + Vercel |
|---------|--------------------------------------------------|
| Given | A GitHub Actions workflow exists at `.github/workflows/deploy-landing.yml` |
| When  | Code is pushed to main with changes in `landing/` |
| Then  | The workflow triggers, builds the Vite project, and deploys to Vercel using the Vercel CLI with project/org tokens from repository secrets |

| **AC9** | App release pipeline builds and publishes artifacts |
|---------|-----------------------------------------------------|
| Given | A GitHub Actions workflow exists at `.github/workflows/release-app.yml` |
| When  | A tag matching `v*` is pushed (e.g. `v0.2.0`) |
| Then  | The workflow builds the Electron app on Windows and macOS runners, creates a GitHub Release with the tag name, and uploads `.exe` and `.dmg` installer assets to the release |

| **AC10** | README documents landing and release workflows |
|----------|------------------------------------------------|
| Given | The root `README.md` is read |
| When  | A developer or contributor reviews the file |
| Then  | It contains: landing page dev instructions (how to run locally, deploy), release instructions (how to tag a version, what the pipeline does, required secrets setup) |

## Open Questions
> None — all resolved.

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (10 AC × 2) + 0 Open Questions = 20, rounded to nearest Fibonacci = 21 → adjusted to 13 given known CI patterns and single-page scope. 1 SP = 2 days.

## Notes
- The `landing/` directory is referenced in the root `README.md` as "Coming soon"
- Theme colors from `application/tailwind.config.js`: `dota-black: #0d0d0d`, `dota-dark: #1a1a2e`, `dota-grey: #a0a0b0`, `dota-gold: #c9a83e`, `dota-amber: #e8b84b`, `dota-red: #c23a2b`, `dota-green: #4caf50`
- Desktop app supports 12 game events: Bounty/Water/Power/Wisdom/Lotus Runes, Night, Day, Neutral Camp, Tormentor, Aghanim Shard, Siege Creep, Flagbearer Creep
- Vercel auto-detects Vite projects; a `vercel.json` with `{ "buildCommand": "...", "outputDirectory": "dist" }` in `landing/` should suffice
- Font stack: Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif
- Video sources confirmed: WebM `https://cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_webm.webm`, MP4 `https://cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_02.mp4`
- GitHub repo: `kent-leow/dota2-announcer` — download CTA links to `/releases/latest`
- Release assets not yet published; landing page links to releases page, user will publish `.exe`/`.dmg` assets separately
- electron-builder config at `application/electron-builder.json`: targets NSIS (Windows) and default dmg (macOS)
- Release workflow requires secrets: none for release (uses `GITHUB_TOKEN`); landing deploy requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` in repo secrets
- To publish a release: `git tag v0.2.0 && git push origin v0.2.0` — the pipeline handles the rest

## Changelog
- 2026-06-15: Resolved OQ1 (video URLs confirmed from dota2.com), OQ2 (no release yet — download links to /releases/latest). Updated AC5 and AC7 with concrete values.
- 2026-06-15: Added AC8 (landing deploy via GitHub Actions + Vercel) and AC9 (app release pipeline). Added CI/CD workflows to scope. Updated estimate to 13 SP.
- 2026-06-15: Added AC10 (README documentation for landing + release workflows). Added README update to scope.
