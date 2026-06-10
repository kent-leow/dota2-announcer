# Task 003 — Two-Column Layout Integration

## Goal
Restructure the main page from single-column to two-column layout, placing existing content on the left and the new GameStatusPanel on the right. Verifiable by visual inspection and responsive behavior on resize.

## Prerequisites
- [ ] task-002.md completed

## Tasks

### Layout Restructure

- [ ] `src/renderer/App.tsx` — Change main tab content area from vertical stack to two-column flex/grid layout; left column contains MainDock + GsiStatus + UpcomingEvents; right column contains GameStatusPanel; add responsive breakpoint to stack vertically on narrow windows
  - [ ] `src/renderer/App.spec.tsx` — Tests: main tab renders two-column layout with left and right sections; GameStatusPanel present in right column; settings tab unchanged; responsive class applied for narrow viewports

## Done When
- [ ] Main tab displays as two-column layout with existing content on left, GameStatusPanel on right
- [ ] Each column takes approximately half the available width
- [ ] Layout stacks vertically when window is narrow (responsive)
- [ ] Settings tab layout is unaffected
- [ ] All new and existing tests pass
