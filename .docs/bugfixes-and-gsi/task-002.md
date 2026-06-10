# Task 002 — Match Lifecycle Detection via GSI

## Goal
Replace the process-detection-based state machine with GSI-driven match lifecycle: detect game start (clock 0:00), game in progress, and match end — controlling the game timer accordingly.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Match State Manager

- [x] `src/dota/matchStateManager.ts` — subscribe to GSI server state events; detect transitions between pre-game/in-match/post-match using `map.game_state`; start timer on `DOTA_GAMERULES_STATE_GAME_IN_PROGRESS`, stop+reset on match end states (new)
  - [x] `src/dota/matchStateManager.spec.ts` — transitions: idle→in-match on game_in_progress; in-match→idle on post-game; ignores draft/hero_selection; resets timer on match end; handles rapid state changes (new)

### IPC Integration

- [x] `src/main/ipcHandlers.ts` — replace `processDetector.startDetection()` with GSI server start + matchStateManager; update `dota:getState` handler to return GSI-derived state; emit `dota:stateChanged` from matchStateManager transitions; bridge gameTimer ticks via `dota:clockTick` IPC channel; add GSI auto-install handlers <!-- re-opened: FIX-001 2026-06-10 --> <!-- fixed: 2026-06-10 -->
  - [x] `src/main/main.spec.ts` — verify IPC handlers register correctly with new GSI-based detection

### Timer Sync

- [x] `src/timer/gameTimer.ts` — add `syncTo(clockSeconds: number)` method so GSI clock data can correct drift; called by matchStateManager on each GSI tick
  - [x] `src/timer/gameTimer.spec.ts` — syncTo adjusts elapsed time; handles negative clock (pre-horn); no-ops when not running

### UI State Contract

- [x] `src/ui/main/MainDock.tsx` — remove direct `gameTimer` import entirely; use `window.electronAPI.onClockTick` for timer display and scheduler ticks <!-- re-opened: FIX-001 2026-06-10 --> <!-- fixed: 2026-06-10 -->
  - [x] `src/ui/main/MainDock.spec.tsx` — verify timer display updates from IPC clock ticks; no direct timer module dependency
- [x] `src/ui/main/UpcomingEvents.tsx` — replace `gameTimer.onTick` with `window.electronAPI.onClockTick` <!-- re-opened: FIX-001 2026-06-10 --> <!-- fixed: 2026-06-10 -->

## Done When
- [x] Timer starts only when GSI reports `DOTA_GAMERULES_STATE_GAME_IN_PROGRESS` <!-- verified 2026-06-10 -->
- [x] Timer does NOT start during hero selection, strategy phase, or when Dota 2 client is merely open <!-- verified 2026-06-10 -->
- [x] Timer resets to 00:00 and scheduler clears when match ends <!-- verified 2026-06-10 -->
- [x] Game clock stays synced with GSI `clock_time` (±1s tolerance) <!-- verified 2026-06-10 -->
- [x] All new and modified tests pass <!-- verified 2026-06-10 -->
- [x] No existing tests broken <!-- verified 2026-06-10 -->

## Changelog
- 2026-06-10: Fixed (FIX-001) — Renderer was importing gameTimer directly creating a disconnected instance. Bridged clock via IPC `dota:clockTick` channel from main process. Also added GSI auto-install IPC handlers.
- 2026-06-10: Fixed (FIX-001) — Added game pause detection via GSI `paused` field; timer stops/resumes on pause/unpause; `dota:pauseChanged` IPC channel added.
