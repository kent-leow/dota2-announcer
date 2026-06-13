# Task 003 — Per-Overlay State & IPC Refactor

## Goal
Replace the single `overlayMode` toggle with independent per-overlay state (enabled, position, fontSize) for both notification and persistent overlays. Wire up new IPC handlers. Verify state persists across sessions.

## Prerequisites
- [ ] task-002.md completed

## Tasks

### State Layer

- [ ] `src/tts/stateStore.ts` — replace flat overlay fields (`overlayMode`, `overlayPosition`, `overlayFontSize`, `overlayEventCount`) with per-overlay structure: `notification: { enabled, position, fontSize }` and `persistent: { enabled, position, fontSize, eventCount }`. Position type changes to `'left' | 'right'`. Add migration from old shape.
  - [ ] `src/tts/stateStore.spec.ts` — test new state shape defaults; test migration from old flat shape to new per-overlay shape; test read/write round-trip

### IPC Layer

- [ ] `src/main/ipcHandlers.ts` — replace `overlay:getMode`/`overlay:setMode`, `overlay:getPosition`/`overlay:setPosition`, `overlay:getFontSize`/`overlay:setFontSize`, `overlay:getEventCount`/`overlay:setEventCount` with per-overlay equivalents: `overlay:notification:getConfig`, `overlay:notification:setConfig`, `overlay:persistent:getConfig`, `overlay:persistent:setConfig`
  - [ ] `src/main/ipcHandlers.spec.ts` — test each new per-overlay IPC handler (get/set for both overlays); verify old handlers removed

### Preload Layer

- [ ] `src/main/preload.ts` — expose new per-overlay config methods on `electronAPI`; remove old single-mode methods
  - [ ] `src/main/preload.spec.ts` — verify new API surface

### Overlay Preload

- [ ] `src/main/overlayPreload.ts` — update `overlayAPI` to receive per-overlay config (both overlays' enabled state, position, fontSize, eventCount)
  - [ ] `src/main/overlayPreload.spec.ts` — verify overlayAPI exposes per-overlay config listeners

## Done When
- [ ] State file stores independent config for notification and persistent overlays
- [ ] Old flat overlay state migrates to new shape on first load
- [ ] IPC handlers serve per-overlay config independently
- [ ] All new and modified tests pass
- [ ] No existing tests broken
