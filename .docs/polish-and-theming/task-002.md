# Task 002 — Tailwind CSS Setup & Theme Configuration

## Goal
Install and configure Tailwind CSS with a custom Dota 2 dark colour palette so all subsequent UI work can use themed utility classes.

## Prerequisites
- [ ] task-001.md completed

## Tasks

### Configuration

- [ ] `package.json` — add `tailwindcss`, `postcss`, `autoprefixer` as devDependencies
- [ ] `tailwind.config.js` — create with content paths, extend theme with Dota 2 colours (new)
  - Custom colours: `dota-black`, `dota-dark`, `dota-grey`, `dota-gold`, `dota-amber`, `dota-red`, `dota-green`
  - Custom font family: sans-serif stack with fallback
- [ ] `postcss.config.js` — create with tailwindcss and autoprefixer plugins (new)
- [ ] `src/renderer/index.css` — create with Tailwind directives (@tailwind base/components/utilities) and base body styles (new)

### Integration

- [ ] `src/renderer/index.tsx` — import `./index.css` to load Tailwind into the app
- [ ] `src/renderer/index.html` — add dark background class to `<body>` for flash-of-unstyled-content prevention
- [ ] `vite.config.ts` — verify PostCSS plugin auto-detected (no change expected, but confirm)

## Done When
- [ ] `npm run dev` starts without PostCSS/Tailwind errors
- [ ] Tailwind utility classes (e.g. `bg-dota-dark text-dota-gold`) apply correctly in browser
- [ ] Custom colour tokens visible in rendered output
- [ ] No existing tests broken
