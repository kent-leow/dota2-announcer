# Task 002 — Roshan State Tracker (GSI Consumer)

## Goal
Implement a Roshan state tracker that consumes GSI state changes, detects transitions (alive→dead, respawn_base→respawn_variable→alive), and emits typed events for downstream notification. Verified by: tracker correctly identifies state transitions and fires callbacks with appropriate event data.

## Prerequisites
- [ ] task-001.md completed

## Tasks

### Tracker Module

- [x] `application/src/dota/roshanTracker.ts` — Create module that: subscribes to `gsiServer.onStateChange`; tracks previous `roshan_state`; detects transitions (alive→respawn_base = killed, respawn_variable→alive = confirmed respawn); tracks `roshan_state_end_seconds` for countdown; fires minute-boundary countdown notifications during respawn_base/respawn_variable; exposes `startListening()`, `stopListening()`, `onRoshanEvent(callback)`, `getRoshanState()`, `_resetForTesting()` (new)
  - [x] `application/src/dota/roshanTracker.spec.ts` — Validates: kill detected on alive→respawn_base transition; no duplicate kill on repeated respawn_base; countdown fires at each minute boundary; transition to respawn_variable state tracked; confirmed respawn detected on →alive; no events when disabled in config; reset clears state; handles paused game (no false countdowns)

### Integration with Match State

- [x] `application/src/dota/matchStateManager.ts` — Import and call `roshanTracker.startListening()` in `startListening()`; call `roshanTracker.stopListening()` and reset on match end (idle phase)
  - [x] `application/src/dota/matchStateManager.spec.ts` — Validates: roshanTracker starts when matchStateManager starts; roshanTracker stops and resets on match end; existing phase transition tests still pass

## Done When
- [x] Roshan kill event fires exactly once per alive→respawn_base transition <!-- verified 2026-06-17 -->
- [x] Countdown events fire at minute boundaries during respawn window <!-- verified 2026-06-17 -->
- [x] Confirmed-alive event fires on respawn_variable/respawn_base→alive transition <!-- verified 2026-06-17 -->
- [x] Tracker resets on match end <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
