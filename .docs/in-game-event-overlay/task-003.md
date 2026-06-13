# Task 003 — Notification UI Component with Fade Animation

## Goal
Build the overlay React component that renders notification cards with fade-in/fade-out animation and auto-dismiss after 5 seconds. Verifiable by triggering events and observing stacking notifications that fade in, persist 5s, then fade out.

## Prerequisites
- [x] task-002.md completed

## Tasks

### Overlay UI Components

- [x] `src/overlay/NotificationStack.tsx` — container component that manages array of active notifications, renders them top-to-right stacked vertically, removes each after fade-out completes (new)
  - Subscribes to `window.overlayAPI.onNotification` on mount
  - Adds notification to state with unique id and `entering` status
  - After mount transition, sets status to `visible`
  - After 5 seconds, sets status to `exiting`
  - After exit transition completes, removes from state
  - [x] `src/overlay/NotificationStack.spec.tsx` — test: adds notification on callback; removes after timeout; multiple notifications coexist; cleanup on unmount

- [x] `src/overlay/NotificationCard.tsx` — presentational component rendering a single notification card with event name and offset context (new)
  - Accepts `eventName`, `offsetSeconds`, `status` props
  - Applies CSS class based on status for animation
  - [x] `src/overlay/NotificationCard.spec.tsx` — test: renders event name; shows correct offset text; applies correct CSS class per status

- [x] `src/overlay/overlay.css` — notification styling: card appearance (dark semi-transparent bg, rounded corners, padding), fade-in keyframe, fade-out keyframe, stacking layout with gap (new)

- [x] `src/overlay/index.tsx` — render `<NotificationStack />` as root component

## Done When
- [x] Notifications appear in top-right of overlay window showing event name and timing <!-- verified 2026-06-13 -->
- [x] Each notification fades in smoothly on arrival <!-- verified 2026-06-13 -->
- [x] Each notification fades out and is removed after 5 seconds <!-- verified 2026-06-13 -->
- [x] Multiple notifications stack vertically without overlap <!-- verified 2026-06-13 -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
