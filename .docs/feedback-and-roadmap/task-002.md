# Task 002 — Feedback Section Component

## Goal
Add a Feedback section to the landing page with categorised buttons linking to pre-filled GitHub Issue templates, verifiable by rendering the section and clicking each link.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Frontend Component

- [x] `landing/src/components/Feedback.tsx` — Create Feedback component with section heading, descriptive paragraph, and three category buttons (Bug Report, Feature Request, Question) each linking to the corresponding GitHub issue template URL with pre-filled parameters (new)
  - [x] `landing/src/components/Feedback.spec.tsx` — Tests: renders heading, renders three category links, each link has correct GitHub issue template href, links open in new tab with noopener noreferrer, section has aria-label, keyboard navigation works (new)

### App Integration

- [x] `landing/src/App.tsx` — Import and render `<Feedback />` between `<Download />` and `<Support />` (after Roadmap is added it will slot between Roadmap and Support)

## Done When
- [x] Feedback section renders on the landing page with three distinct category buttons <!-- verified 2026-06-15 -->
- [x] Each button links to the correct GitHub issue template URL with pre-filled title prefix and labels <!-- verified 2026-06-15 -->
- [x] Links open in a new tab with `rel="noopener noreferrer"` <!-- verified 2026-06-15 -->
- [x] Section has proper `aria-label` and keyboard-accessible links <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
