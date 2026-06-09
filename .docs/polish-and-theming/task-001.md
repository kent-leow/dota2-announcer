# Task 001 — Code Audit & Bug Fixes

## Goal
Verify all backend modules compile, tests pass, and fix any logic bugs discovered — confirming the app functions correctly before UI work begins.

## Prerequisites
- None

## Tasks

### Config

- [ ] `src/config/events.schema.ts` — review schema covers all event fields used by scheduler
  - [ ] `src/config/events.schema.spec.ts` — verify valid/invalid payloads, edge cases (empty arrays, missing optional fields)
- [ ] `src/config/eventsLoader.ts` — review load/reload logic; confirm file-read errors are handled
  - [ ] `src/config/eventsLoader.spec.ts` — verify reload replaces state, invalid JSON handling, missing file fallback
- [ ] `src/config/defaults.ts` — verify all required Dota 2 events present with correct timings
  - [ ] `src/config/defaults.spec.ts` — verify all event IDs unique, spawnTime values match known Dota timings

### Timer

- [ ] `src/timer/gameTimer.ts` — verify start/stop/reset lifecycle, tick accuracy, no drift accumulation
  - [ ] `src/timer/gameTimer.spec.ts` — verify tick fires every second, reset zeroes elapsed, stop halts ticks

### Process Detection

- [ ] `src/dota/processDetector.ts` — verify state machine transitions (idle → in-match → idle), listener cleanup
  - [ ] `src/dota/processDetector.spec.ts` — verify state change callbacks fire correctly, no double-fire on rapid transitions

### Scheduler

- [ ] `src/scheduler/eventScheduler.ts` — verify one-time and repeating event scheduling, deduplication guard
  - [ ] `src/scheduler/eventScheduler.spec.ts` — verify dedup prevents double-fire, repeating events reschedule, getUpcoming returns correct order

### TTS

- [ ] `src/tts/announcer.ts` — verify speak function respects mute state and volume
  - [ ] `src/tts/announcer.spec.ts` — verify muted suppresses speech, volume applied, queue behaviour
- [ ] `src/tts/muteManager.ts` — verify toggle returns correct state
  - [ ] `src/tts/muteManager.spec.ts` — verify toggle flips state, isMuted reads correctly
- [ ] `src/tts/volumeController.ts` — verify set/get clamps 0–100
  - [ ] `src/tts/volumeController.spec.ts` — verify boundary values (0, 100, negative, >100)

### Hotkeys

- [ ] `src/hotkeys/globalHotkeys.ts` — verify registration/unregistration, correct actions bound
  - [ ] `src/hotkeys/globalHotkeys.spec.ts` — verify Ctrl+Shift+M triggers mute toggle, Ctrl+Shift+R triggers reload

### Main Process

- [ ] `src/main/main.ts` — verify window creation, IPC wiring, graceful shutdown
  - [ ] `src/main/main.spec.ts` — verify IPC handlers registered, window lifecycle

## Done When
- [ ] `npm run test` passes with zero failures
- [ ] `npm run build:renderer` and `npm run build:main` complete without errors
- [ ] Any bugs discovered during audit are fixed and covered by tests
- [ ] No existing tests broken
