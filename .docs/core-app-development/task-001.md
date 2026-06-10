# Task 001 — Config Loading, Validation & Defaults (AC3, AC6)

## Goal
Create the config subsystem: schema validation, file loader with reload capability, default event definitions for all Dota 2 objects in AC6, and a basic UI panel showing loaded events. Verified by inspecting the loaded-events view after launch — all entries present and structurally correct.

## Prerequisites
- [x] task-000.md completed (project scaffolding, Electron shell, test runner) <!-- verified 2026-06-10 -->

## Tasks

### Config schema

- `src/config/events.schema.ts` (new) — Zod schema enforcing required fields (`id`, `name`, `spawnTime`) and optional `repeatEvery` / `warnings[]`. Positive numerics only.
  - [x] `src/config/events.schema.spec.ts` — valid config parses; reject missing id/spawnTime, non-numeric values

### Config loader

- `src/config/eventsLoader.ts` (new) — reads events.json on boot via Node fs, validates with schema above, caches result in-memory. Exports `reload()` that re-reads disk and overwrites cache. Falls back to defaults on parse/validation failure.
  - [x] `src/config/eventsLoader.spec.ts` — happy-path load; reload fetches fresh disk state (verify different timestamps yield diff results); malformed JSON triggers fallback without crash

### Default events

- `src/config/defaults.ts` (new) — expts all nine Dota 2 event groups: Bounty/Water/Power/Wisdom runes; Lotus Pool cycles; first + recurring day/night transitions per game-file timings; Neutral Camps Phase I & II spawns; Tormentor on Night 3 per wiki; Roshan reminders at standard intervals.
  - [x] `src/config/defaults.spec.ts` — assert all nine event groups present with correct IDs/names

### Config panel UI

- `src/ui/settings/EventConfigPanel.tsx` (new) — Renders loaded events list (id, name, spawnTime, warnings). "Reload Events" button calls loader's reload().
  - [x] `src/ui/settings/EventConfigPanel.spec.tsx` — mounts; lists all event names on render; reload button present/wired

## Done When
- [x] Config auto-loads on startup and via UI refresh (AC3) <!-- verified 2026-06-10 -->
- [x] All Dota objects in AC6 are default-loaded (visible in DevTools after launch, confirmed by inspecting rendered entries) <!-- verified 2026-06-10 -->

## Changelog

- 2026-06-10: Fixed (FIX-004) — Replaced `process.cwd()` with `app.getAppPath()` in eventsLoader.ts for reliable path resolution in packaged builds
