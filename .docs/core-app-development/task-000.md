# Task 000 — Project Scaffolding & Electron Shell (Foundation)

## Goal
Initialize a working Electron + React + TypeScript project with test runner configured, producing a launchable empty window. Verified by running `npm start` and seeing a blank Electron window appear with DevTools accessible.

## Prerequisites
- None (absolute first slice)

## Tasks

### Project init

- [x] `package.json` (new) — Electron app manifest with scripts: `start`, `build`, `test`. Pin Electron, React, ReactDOM, TypeScript, Zod versions.
  > No test (config-only file).

- [x] `tsconfig.json` (new) — Strict TS config targeting ES2022, JSX react-jsx, paths alias for `src/`.
  > No test (config-only file).

- [x] `electron-builder.json` (new) — Windows exe build config (nsis installer, app icon placeholder, output to `dist/`).
  > No test (config-only file).

### Electron main process

- [x] `src/main/main.ts` (new) — Electron app entry: creates BrowserWindow, loads renderer index.html, handles app lifecycle (ready, window-all-closed, activate).
  - [x] `src/main/main.spec.ts` — app launches without error; BrowserWindow is created with expected dimensions

### Renderer entry

- [x] `src/renderer/index.html` (new) — Minimal HTML shell with root div for React mount.
  > No test (static markup).

- [x] `src/renderer/index.tsx` (new) — React 18 createRoot mounting an `<App />` placeholder component.
  > No test (entry-point-only).

- [x] `src/renderer/App.tsx` (new) — Placeholder component rendering "Dota 2 Announcer" heading. Will be replaced by MainDock in task-002.
  - [x] `src/renderer/App.spec.tsx` — mounts without crash; renders heading text

### Test infrastructure

- [x] `jest.config.ts` (new) — Jest config with ts-jest preset, jsdom environment for renderer specs, node environment for main/service specs.
  > No test (config-only file).

### Build tooling

- [x] `vite.config.ts` (new) — Bundler config for renderer (React+TS) and main process (Node+TS) using vite-plugin-electron.
  > No test (config-only file).

### Config directory

- [x] `config/events.json` (new) — Empty placeholder `{ "events": [] }` so task-001 has the file path ready.
  > No test (data-only file).

## Done When
- [x] `npm install` completes without errors <!-- verified 2026-06-10 -->
- [x] `npm test` runs and passes (App spec + main spec) <!-- verified 2026-06-10 -->
- [ ] `npm start` launches an Electron window showing "Dota 2 Announcer" heading <!-- blocked: no network to download Electron binary -->
- [ ] `npm run build` produces a Windows executable in `dist/` <!-- blocked: no network for Electron binary + not on Windows -->

## Changelog

- 2026-06-10: Fixed (FIX-001) — Added GPU cache switches to `src/main/main.ts` to prevent black screen on Windows due to disk cache access errors
