# Task 001 — Schema & Config: Dynamic Event Type

## Goal
Extend the event schema with a `type` discriminator and dynamic event config structure so the system can distinguish fixed from dynamic events, persisting both in one config file. Verified by: existing events load with default `type: "fixed"`, dynamic events validate correctly, and config round-trips through save/load.

## Prerequisites
- None

## Tasks

### Schema Layer

- [x] `application/src/config/events.schema.ts` — Add `type` field (enum: `"fixed"` | `"dynamic"`, default `"fixed"`) to `eventSchema`; add `dynamicEventConfigSchema` (id, name, enabled, notifications object with kill/countdown/respawn booleans); add `dynamicEventsConfigSchema` wrapping array; export types
  - [x] `application/src/config/events.schema.spec.ts` — Validates: event without type defaults to fixed; event with type "dynamic" passes; invalid type rejects; dynamicEventConfig validates enabled/notifications fields; missing required fields reject

### Config Defaults

- [x] `application/src/config/defaults.ts` — Add `DEFAULT_DYNAMIC_EVENTS` array containing Roshan config (id: "roshan", name: "Roshan", enabled: true, notifications: { kill: true, countdown: true, respawn: true })
  - [x] `application/src/config/defaults.spec.ts` — Validates: DEFAULT_DYNAMIC_EVENTS has roshan entry; roshan config matches dynamic schema; all notification flags default true

### Loader Layer

- [x] `application/src/config/eventsLoader.ts` — Extend `loadEvents`/`saveEvents`/`getEvents` to handle `dynamicEvents` field in the config JSON alongside `events`; add `getDynamicEvents()` and `saveDynamicEvents()` exports
  - [x] `application/src/config/eventsLoader.spec.ts` — Validates: load config with no dynamicEvents returns defaults; load config with valid dynamicEvents returns them; save round-trips dynamic config; existing fixed-only config still loads (backward compat)

### State Store

- [x] `application/src/tts/stateStore.ts` — Add `dynamicEvents` field to `AppState` interface; parse it in `readAppState()`; include in `writeAppState()`; default to `DEFAULT_DYNAMIC_EVENTS` when missing
  - [x] `application/src/tts/stateStore.spec.ts` — Validates: readAppState without dynamicEvents returns defaults; writeAppState persists dynamicEvents; existing state files without the field migrate gracefully

## Done When
- [x] Events without `type` field load as `type: "fixed"` — backward compatible <!-- verified 2026-06-17 -->
- [x] Dynamic event config (Roshan) validates via Zod schema <!-- verified 2026-06-17 -->
- [x] Dynamic event config persists in same JSON file alongside fixed events <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
