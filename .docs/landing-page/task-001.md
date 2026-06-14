# Task 001 — Project Scaffold and Theme Setup

## Goal
Scaffold the `landing/` Vite + React + Tailwind project with Dota 2 theme colours so it builds cleanly and renders a styled shell page.

## Prerequisites
- None

## Tasks

### Project Config

- [x] `landing/package.json` — Vite + React + Tailwind dependencies, scripts: `dev`, `build`, `preview` (new)
- [x] `landing/vite.config.ts` — Vite config with React plugin (new)
- [x] `landing/tsconfig.json` — TypeScript config extending strict, JSX react-jsx (new)
- [x] `landing/tailwind.config.js` — Tailwind config with Dota 2 theme colours (`dota-black`, `dota-dark`, `dota-grey`, `dota-gold`, `dota-amber`, `dota-red`, `dota-green`) and font family (new)
- [x] `landing/postcss.config.js` — PostCSS with Tailwind and Autoprefixer (new)
- [x] `landing/index.html` — HTML entry point loading Inter font and `/src/main.tsx` (new)
- [x] `landing/.gitignore` — Ignore `node_modules`, `dist`, `.vercel` (new)

### Source

- [x] `landing/src/main.tsx` — React DOM render entry (new)
- [x] `landing/src/App.tsx` — Shell layout component: header, main slot, footer; uses theme classes (new)
  - [x] `landing/src/App.spec.tsx` — Renders without crash; applies `bg-dota-black` class to root container
- [x] `landing/src/index.css` — Tailwind directives, base body styles matching desktop app (new)

## Done When
- [x] `npm run build` in `landing/` succeeds with zero errors <!-- verified 2026-06-15 -->
- [x] Dev server (`npm run dev`) renders a dark-themed shell page with gold accents <!-- verified 2026-06-15 -->
- [x] Tailwind classes `bg-dota-black`, `text-dota-gold`, `text-dota-grey` resolve correctly <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
