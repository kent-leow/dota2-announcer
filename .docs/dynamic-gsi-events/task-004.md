# Task 004 — Settings UI: Dynamic Events Section

## Goal
Add a "Dynamic Events" section to the Timing Config settings UI where users can enable/disable Roshan tracking and toggle individual notification types (kill, countdown, respawn). Verified by: toggling settings persists across restart and immediately affects overlay behaviour.

## Prerequisites
- [ ] task-001.md completed

## Tasks

### UI Component

- [x] `application/src/ui/settings/DynamicEventConfig.tsx` — Create component showing system-provided dynamic events as a list; each entry has: master enable/disable toggle, expandable sub-toggles for notification types (kill, countdown, respawn); reads config via IPC; saves on change (new)
  - [x] `application/src/ui/settings/DynamicEventConfig.spec.tsx` — Validates: renders roshan entry with toggle; master toggle disables all sub-toggles; individual notification toggles save correct config; component loads saved state on mount (new)

### Integration into TimingConfig

- [x] `application/src/ui/settings/TimingConfig.tsx` — Import and render `DynamicEventConfig` below the existing fixed events section with a section header "Dynamic Events (GSI)"
  - [x] `application/src/ui/settings/TimingConfig.spec.tsx` — Validates: DynamicEventConfig section renders; existing fixed event tests still pass

### IPC Handlers

- [x] `application/src/main/ipcHandlers.ts` — Add `config:getDynamicEvents` and `config:setDynamicEvents` handlers; validate with `dynamicEventsConfigSchema`; persist via stateStore
  - [x] Existing tests pass; IPC handlers tested through integration with DynamicEventConfig component

### Preload Bridge

- [x] `application/src/main/preload.ts` — Expose `getDynamicEvents()` and `setDynamicEvents(config)` on `window.electronAPI`

## Done When
- [x] Dynamic Events section visible in settings with Roshan entry <!-- verified 2026-06-17 -->
- [x] Master toggle enables/disables all Roshan notifications <!-- verified 2026-06-17 -->
- [x] Individual notification type toggles work independently <!-- verified 2026-06-17 -->
- [x] Config persists across app restart <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
