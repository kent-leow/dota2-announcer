# Task 003 — Event Scheduler with Deduplication Guard (AC4, AC5)

## Goal
Schedule events from config against clock ticks and fire TTS at exact warning offsets sorted descending; verify one-time fires once per cycle, repeating fires repeatedly at intervals. No duplicate announcements. Verified by setting a test config with one-time + repeating event, advancing the clock to each scheduled offset in an integration spec run — verifications execute against scheduler's callback invocations without reading any code.

## Prerequisites
- [ ] task-002.md completed (consumes `gameTimer.getElapsedMillis()` and config events from task-001)

## Tasks

### Scheduler types

- `src/scheduler/eventSchedulerTypes.ts` — new; interfaces/types for schedulable events (`fireId`, `eventName`, `offsetSeconds`, `timestamp`) — pure type definitions, no test needed.
  \> No test (type-only file).

### Event scheduler core

- `src/scheduler/eventScheduler.ts` — new; subscribes to game clock ticks and loaded config events from task-001/002; computes fire times per `spawnTime` + `repeatEvery`; fires TTS callbacks sorted by descending offset order per `warnings` array; tracks fired IDs via TTL (expires when clock advances past `offset+1s` or game resets) for deduplication.
  - [ ] `src/scheduler/eventScheduler.spec.ts` — test blocks:
    - One-time event fires exactly once at its spawn time ±0 ticks, producing only one announcement token/callback invocation
    - Repeating event with `[60,30]` warnings fires two tokens per occurrence in descending order; repeats correctly across cycles when `repeatEvery > 0`
    - Dedup guard suppresses double-fire when multiple tick callbacks land at the same offset simultaneously
    - Reloading config (via loader's `reload()`) clears all fired state so events can re-announce in a new cycle
    - Game reset clears all pending and fired fire history

## Done When
- One-time event fires exactly once per match phase when clock reaches spawnTime (AC4 verified by scheduler callback invocations)
- Repeating events.fire at correct intervals with multiple warnings in descending order, each firing once per occurrence (AC5 verified via spec assertions on invocation counts)
- All new and modified tests pass
- No existing tests broken
