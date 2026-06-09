# Task 003 — Main UI Layout & Theme Styling

## Goal
Restyle the MainDock, UpcomingEvents, and App shell with Tailwind using the Dota 2 dark theme — producing a polished, structured layout with clear visual sections.

## Prerequisites
- [x] task-002.md completed

## Tasks

### App Shell

- [x] `src/renderer/App.tsx` — restructure as themed container with header, main content area, and footer sections; compose MainDock + UpcomingEvents
  - [x] `src/renderer/App.spec.tsx` — verify renders MainDock and UpcomingEvents, header displays app title

### Main Dock

- [x] `src/ui/main/MainDock.tsx` — restyle with Tailwind: status badge (gold for in-match, grey for idle), large timer display, styled control buttons (mute, start/stop, reload), volume slider with custom track/thumb
  - [x] `src/ui/main/MainDock.spec.tsx` — verify status renders correct text, controls visible, volume slider present

### Upcoming Events

- [x] `src/ui/main/UpcomingEvents.tsx` — restyle as card list or table with alternating row colours, countdown in monospace, event names prominent
  - [x] `src/ui/main/UpcomingEvents.spec.tsx` — verify event rows render with name and countdown, empty state displays message

### Event Config Panel

- [x] `src/ui/settings/EventConfigPanel.tsx` — restyle table with dark themed rows, gold headers, hover states, reload button styled consistently
  - [x] `src/ui/settings/EventConfigPanel.spec.tsx` — verify table renders events, reload button present and triggers reload

## Done When
- [x] All UI components render with Dota 2 dark theme (no unstyled HTML elements) <!-- verified 2026-06-10 -->
- [x] Layout has distinct visual sections: header/status, timer, controls, events list <!-- verified 2026-06-10 -->
- [x] Buttons, slider, and table are visually consistent with gold accent theme <!-- verified 2026-06-10 -->
- [x] All existing component tests pass <!-- verified 2026-06-10 -->
- [x] No regressions in functionality (mute, volume, start/stop, reload still work) <!-- verified 2026-06-10 -->
