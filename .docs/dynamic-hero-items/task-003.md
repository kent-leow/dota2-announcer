# Task 003 — Config & Lifecycle Integration

## Goal
Add "Hero Items" dynamic event config entry and wire the items tracker into the app lifecycle (start/stop alongside Roshan tracker). Verified by: tracker starts with match, config toggle disables it, app state persists the setting.

## Prerequisites
- [ ] task-002.md completed

## Tasks

### Config Schema

- [x] `application/src/config/events.schema.ts` — Add `heroItemsNotificationsSchema` with `acquired: boolean` and `sold: boolean` fields; update `dynamicEventConfigSchema` to support union of roshan and hero-items notification shapes (or make notifications generic via passthrough)
  - [x] `application/src/config/events.schema.spec.ts` — Add tests: hero-items config with acquired/sold booleans validates; missing fields reject

### Defaults

- [x] `application/src/config/defaults.ts` — Add hero-items entry to `DEFAULT_DYNAMIC_EVENTS.dynamicEvents` array: `{ id: "hero-items", name: "Hero Items", enabled: true, notifications: { acquired: true, sold: true } }`
  - [x] `application/src/config/defaults.spec.ts` — Add test: DEFAULT_DYNAMIC_EVENTS contains hero-items entry with correct shape

### Lifecycle

- [x] `application/src/dota/matchStateManager.ts` — Import `itemsTracker`; call `itemsTracker.startListening()` in `startListening()`; call `itemsTracker._resetForTesting()` on post-game/disconnect cleanup
  - [x] `application/src/dota/matchStateManager.spec.ts` — Add tests: itemsTracker.startListening called when matchStateManager starts; itemsTracker reset on post-game transition

## Done When
- [x] "Hero Items" appears in dynamic events config with `acquired` and `sold` toggles <!-- verified 2026-06-17 -->
- [x] Items tracker starts/stops with match lifecycle <!-- verified 2026-06-17 -->
- [x] Config persists across app restart (via existing eventsLoader/stateStore) <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
