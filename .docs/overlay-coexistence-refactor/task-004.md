# Task 004 — Overlay Window Coexistence & Positioning

## Goal
Refactor the overlay window so both notification and persistent components render simultaneously within a single window. Position each based on its own left/right setting. When same-side, notification renders below persistent. Verify both overlays display independently.

## Prerequisites
- [ ] task-003.md completed

## Tasks

### Overlay Window Management

- [ ] `src/main/overlayWindow.ts` — update `computePosition()` to accept simplified `'left' | 'right'` values; adjust window to full-screen-height transparent canvas (both overlays render inside via CSS positioning, not window bounds)
  - [ ] `src/main/overlayWindow.spec.ts` — test position computation for left/right; test window covers full screen height

### Overlay Root Component

- [ ] `src/overlay/OverlayRoot.tsx` — render both `NotificationStack` and `PersistentPanel` simultaneously (not conditionally); pass each its own enabled/position/fontSize config; hide component when its `enabled` is false
  - [ ] `src/overlay/OverlayRoot.spec.tsx` — test: both rendered when both enabled; only one when other disabled; neither when both disabled

### Notification Stack Positioning

- [ ] `src/overlay/NotificationStack.tsx` — accept position prop (`'left' | 'right'`); accept vertical offset prop for same-side stacking; apply CSS alignment accordingly
  - [ ] `src/overlay/NotificationStack.spec.tsx` — test left vs right alignment; test offset applied when same-side

### Persistent Panel Positioning

- [ ] `src/overlay/PersistentPanel.tsx` — accept position prop (`'left' | 'right'`); apply CSS alignment accordingly; report rendered height (via ref/callback) for same-side offset calculation
  - [ ] `src/overlay/PersistentPanel.spec.tsx` — test left vs right alignment; test height reporting

### Stacking Logic

- [ ] `src/overlay/OverlayRoot.tsx` — when both overlays share the same side, pass persistent panel's height as vertical offset to notification stack so notifications appear below
  - [ ] `src/overlay/OverlayRoot.spec.tsx` — test offset passed when same side; zero offset when different sides

### Overlay CSS

- [ ] `src/overlay/overlay.css` — update positioning classes for left/right alignment; remove `left-center`/`right-center` references; add offset-based top positioning for notification stack

## Done When
- [ ] Both overlays render simultaneously when both enabled
- [ ] Each overlay positions independently (left or right)
- [ ] When same-side, notification appears below persistent without overlap
- [ ] When opposite sides, each occupies its own side
- [ ] Disabling one overlay hides only that overlay
- [ ] All new and modified tests pass
- [ ] No existing tests broken
