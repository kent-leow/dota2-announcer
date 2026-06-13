# Task 005 — Settings UI: Per-Overlay Configuration & Instant Apply

## Goal
Rebuild the overlay settings UI with separate sections for notification and persistent overlays, each with independent controls. All changes apply instantly — no save/apply buttons. Verify each setting updates the overlay in real-time.

## Prerequisites
- [x] task-003.md completed

## Tasks

### Settings UI Refactor

- [x] `src/ui/settings/TimingConfig.tsx` — replace single overlay config section with two sections ("Notification Overlay" and "Persistent Overlay"), each containing: enable toggle, position selector (left/right), font size controls. Persistent section additionally has event count slider. Remove old mode toggle, sound assignment UI, and any save/apply buttons.
  - [x] `src/ui/settings/TimingConfig.spec.tsx` — test: both sections render; toggling notification enable calls correct IPC; toggling persistent enable calls correct IPC; position change calls per-overlay IPC; font size change calls per-overlay IPC; event count change calls persistent IPC; no save/apply button exists

### Instant Apply

- [x] `src/ui/settings/TimingConfig.tsx` — every onChange handler calls the IPC setter immediately (no local form state + save pattern); numeric inputs (font size, event count) call IPC on every value change
  - [x] `src/ui/settings/TimingConfig.spec.tsx` — test: changing a numeric input fires IPC call immediately without requiring button click

### Remove Sound UI

- [x] `src/ui/settings/TimingConfig.tsx` — remove per-event sound file picker, sound toggle, and all sound-related controls (already partially done in task-001, ensure nothing remains)
  - [x] `src/ui/settings/TimingConfig.spec.tsx` — test: no sound-related controls in the rendered output

## Done When
- [x] Settings shows separate notification and persistent overlay sections
- [x] Each section has enable toggle, position selector, font size control
- [x] Persistent section has event count control
- [x] All changes apply immediately with no save/apply button
- [x] No sound/music controls remain in settings
- [x] All new and modified tests pass
- [x] No existing tests broken
