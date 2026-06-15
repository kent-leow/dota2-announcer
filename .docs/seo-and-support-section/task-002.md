# Task 002 — Semantic HTML & Accessibility Improvements

## Goal
Improve heading hierarchy, add section landmarks with aria-labels, and ensure all interactive elements have accessible text so crawlers and screen readers parse the page correctly.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Components

- [x] `landing/src/components/Hero.tsx` — ensure `<h1>` is the only h1 on the page; add `aria-label="Hero"` to the `<section>`; add accessible label to the "Download Now" CTA link
- [x] `landing/src/components/Features.tsx` — add `aria-label="Features"` to the `<section>`; verify `<h2>` for section heading, `<h3>` for feature cards (already correct)
- [x] `landing/src/components/Download.tsx` — add `aria-label="Download"` to the `<section>`; add `aria-label` attributes to platform download links describing the action
- [x] `landing/src/components/Footer.tsx` — change `<footer>` to include `aria-label="Footer"`; add `aria-label` to GitHub link

### Tests

- [x] `landing/src/components/Hero.spec.tsx` — add test for aria-label on section and exactly one h1 element
  - [x] Section has `aria-label="Hero"`
  - [x] Only one `<h1>` in the rendered output
- [x] `landing/src/components/Features.spec.tsx` — add test for aria-label on section
  - [x] Section has `aria-label="Features"`
- [x] `landing/src/components/Download.spec.tsx` — add test for aria-label on section and links
  - [x] Section has `aria-label="Download"`
  - [x] Download links have descriptive aria-labels
- [x] `landing/src/components/Footer.spec.tsx` — add test for aria-label on footer and GitHub link
  - [x] Footer has `aria-label="Footer"`
  - [x] GitHub link has accessible label

## Done When
- [x] Page has exactly one `<h1>` element <!-- verified 2026-06-15 -->
- [x] All major sections (`Hero`, `Features`, `Download`, `Footer`) have `aria-label` attributes <!-- verified 2026-06-15 -->
- [x] All interactive links have accessible text or `aria-label` <!-- verified 2026-06-15 -->
- [x] Heading hierarchy is sequential (h1 → h2 → h3, no skips) <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
