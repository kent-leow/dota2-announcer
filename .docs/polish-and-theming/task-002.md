# Task 002 — Tailwind CSS Setup & Theme Configuration

## Goal
Install and configure Tailwind CSS with a custom Dota 2 dark colour palette so all subsequent UI work can use themed utility classes.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Configuration

- [x] `package.json` — add `tailwindcss`, `postcss`, `autoprefixer` as devDependencies
- [x] `tailwind.config.js` — create with content paths, extend theme with Dota 2 colours (new)
  - Custom colours: `dota-black`, `dota-dark`, `dota-grey`, `dota-gold`, `dota-amber`, `dota-red`, `dota-green`
  - Custom font family: sans-serif stack with fallback
- [x] `postcss.config.js` — create with tailwindcss and autoprefixer plugins (new)
- [x] `src/renderer/index.css` — create with Tailwind directives (@tailwind base/components/utilities) and base body styles (new)

### Integration

- [x] `src/renderer/index.tsx` — import `./index.css` to load Tailwind into the app
- [x] `src/renderer/index.html` — add dark background class to `<body>` for flash-of-unstyled-content prevention
- [x] `vite.config.ts` — verify PostCSS plugin auto-detected (no change expected, but confirm) <!-- verified — Vite auto-detects postcss.config.js -->

## Done When
- [x] `npm run dev` starts without PostCSS/Tailwind errors <!-- verified 2026-06-10 -->
- [x] Tailwind utility classes (e.g. `bg-dota-dark text-dota-gold`) apply correctly in browser <!-- verified 2026-06-10 — custom tokens present in built CSS -->
- [x] Custom colour tokens visible in rendered output <!-- verified 2026-06-10 -->
- [x] No existing tests broken <!-- verified 2026-06-10 -->
