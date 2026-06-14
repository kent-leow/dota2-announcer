# Agent README

Monorepo with two packages:

## Structure

- `application/` — Electron desktop app (the product). Has its own `package.json`, `tsconfig.json`, build tooling. Run all npm/test/build commands from this directory.
- `landing/` — Landing/download website (not yet developed).

## Quick Reference

| Action | Command | CWD |
|--------|---------|-----|
| Install | `npm install` | `application/` |
| Test | `npm test` | `application/` |
| Dev | `npm start` | `application/` |
| Build | `npx vite build` | `application/` |
| Type check | `npx tsc --noEmit` | `application/` |

## Key Points

- All app source lives in `application/src/` — split into `main/`, `renderer/`, `overlay/`, and service modules.
- Game State Integration server listens on port 44444.
- Config files in `application/config/`.
- Tests use Jest with three projects: main, services, renderer.
- For detailed app architecture see `application/AGENTREADME.md`.
