# Task 003 — Main UI Layout & Theme Styling

## Goal
Restyle the MainDock, UpcomingEvents, and App shell with Tailwind using the Dota 2 dark theme — producing a polished, structured layout with clear visual sections.

## Prerequisites
- [ ] task-002.md completed

## Tasks

### App Shell

- [ ] `src/renderer/App.tsx` — restructure as themed container with header, main content area, and footer sections; compose MainDock + UpcomingEvents
  - [ ] `src/renderer/App.spec.tsx` — verify renders MainDock and UpcomingEvents, header displays app title

### Main Dock

- [ ] `src/ui/main/MainDock.tsx` — restyle with Tailwind: status badge (gold for in-match, grey for idle), large timer display, styled control buttons (mute, start/stop, reload), volume slider with custom track/thumb
  - [ ] `src/ui/main/MainDock.spec.tsx` — verify status renders correct text, controls visible, volume slider present

### Upcoming Events

- [ ] `src/ui/main/UpcomingEvents.tsx` — restyle as card list or table with alternating row colours, countdown in monospace, event names prominent
  - [ ] `src/ui/main/UpcomingEvents.spec.tsx` — verify event rows render with name and countdown, empty state displays message

### Event Config Panel

- [ ] `src/ui/settings/EventConfigPanel.tsx` — restyle table with dark themed rows, gold headers, hover states, reload button styled consistently
  - [ ] `src/ui/settings/EventConfigPanel.spec.tsx` — verify table renders events, reload button present and triggers reload

## Done When
- [ ] All UI components render with Dota 2 dark theme (no unstyled HTML elements)
- [ ] Layout has distinct visual sections: header/status, timer, controls, events list
- [ ] Buttons, slider, and table are visually consistent with gold accent theme
- [ ] All existing component tests pass
- [ ] No regressions in functionality (mute, volume, start/stop, reload still work)
