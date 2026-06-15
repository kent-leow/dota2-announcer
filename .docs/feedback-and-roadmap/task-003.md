# Task 003 — Roadmap Data & Component

## Goal
Add a Roadmap section displaying planned/in-progress/completed milestones from a standalone data file, verifiable by rendering grouped items on the landing page.

## Prerequisites
- [x] task-002.md completed

## Tasks

### Roadmap Data

- [x] `landing/src/data/roadmapData.ts` — Create typed roadmap data array with items grouped by status (Planned, In Progress, Done), each item having title, description, and status. Initial content per plan Notes (new)

### Frontend Component

- [x] `landing/src/components/Roadmap.tsx` — Create Roadmap component rendering a card/timeline view grouped by status columns (Planned → In Progress → Done), consuming data from `roadmapData.ts` (new)
  - [x] `landing/src/components/Roadmap.spec.tsx` — Tests: renders section heading, renders all three status groups, renders correct items per group, section has aria-label, items are keyboard-accessible, responsive layout classes present (new)

### App Integration

- [x] `landing/src/App.tsx` — Import and render `<Roadmap />` between `<Download />` and `<Feedback />`

## Done When
- [x] Roadmap section renders on the landing page with three status groups <!-- verified 2026-06-15 -->
- [x] Items match the data in `roadmapData.ts` <!-- verified 2026-06-15 -->
- [x] Changing `roadmapData.ts` content reflects on the page without touching component code <!-- verified 2026-06-15 -->
- [x] Section has proper `aria-label` and all items are accessible <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
