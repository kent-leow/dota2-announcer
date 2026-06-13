# Task 002 — Remove Start/Stop & Reload Config Buttons

## Goal
Remove the non-functional Start/Stop button and the Reload Config button from the main page. Config reloads automatically when event timing changes. Verify main page renders without these controls.

## Prerequisites
- [ ] task-001.md completed

## Tasks

### Main Page

- [ ] `src/ui/main/MainDock.tsx` — remove `handleStartStop` callback, `announcing` state, Start/Stop button JSX, and Reload Config button + its `reloadEvents()` call
  - [ ] `src/ui/main/MainDock.spec.tsx` — remove tests for start/stop toggle and reload button; add test verifying neither button renders

### Auto-Reload on Config Change

- [ ] `src/ui/main/MainDock.tsx` — ensure event scheduler re-initialises when config changes (via existing IPC listener or add `config:changed` listener if needed) so manual reload is unnecessary
  - [ ] `src/ui/main/MainDock.spec.tsx` — verify scheduler refreshes when events config updates without manual trigger

### IPC Layer

- [ ] `src/main/ipcHandlers.ts` — if `config:reloadEvents` handler is now unused, remove it; if still used internally, keep but remove from preload exposure
  - [ ] `src/main/ipcHandlers.spec.ts` — adjust tests for removed/retained reload handler

## Done When
- [ ] Main page has no Start/Stop button
- [ ] Main page has no Reload Config button
- [ ] Changing event timings in settings automatically applies to the running scheduler
- [ ] All new and modified tests pass
- [ ] No existing tests broken
