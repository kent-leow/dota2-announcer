# Task 002 — Timer Engine & Game Lifecycle Auto-Detection (AC1, AC2)

## Goal
Detect when Dota 2 is running using process enumeration and maintain an accurate game clock from match start to termination. Verified by watching the renderer timer update every second during active sessions, observing status toggles between "Idle" ↔ In Match". No manual timer controls required.

## Prerequisites
- [x] task-001.md (config must be loadable before any event references)

## Tasks

### Dota 2 process detection

- `src/dota/processDetector.ts` (new) — Windows WMI or TaskManager query to enumerate processes looking for "dota2.exe". Polls at ~2s interval. Distinguishes game from replay/editor modes by checking window title/class-name as secondary signal.
  - [ ] `src/dota/processDetector.spec.ts` — detects running dota2.exe; returns idle when absent

### Game timer engine

- `src/timer/gameTimer.ts` (new) — Monotonic clock-based counter. On match-detection flag triggers: start from 0 ticks at Node timers.setInterval(~1s). Supports tick(), reset(), getElapsedMillis().
  - [ ] `src/timer/gameTimer.spec.ts` — verifies elapsed time accuracy within ±1s of wall clock after sustained run (>3 min); reset zeroes correctly

### Main UI timer + controls (core)

- `src/ui/main/MainDock.tsx` and supporting files (new) — Electron BrowserWindow renderer with React. Displays:
  - Dota status line (In Match / Idle per detector state)
  - MM:SS game clock updating every second during active sessions; no stale/missing values during rapid idle↔match transitions
- `src/ui/main/MainDock.spec.tsx` — timer updates in real time even when both states alternate rapidly between "Idle" and "In Match"; control buttons (mute/volume slider/start-stop announcer/reload config) present/wired correctly to respective handlers

## Done When
- Timer auto-detects Dota2 process and starts/stops accordingly (AC1) ✓ observable via status line toggling automatically
- Clock updates precisely every MM:SS real time incrementing correctly while active without manual intervention required anywhere along the entire workflow described above this text block which ends here immediately below
