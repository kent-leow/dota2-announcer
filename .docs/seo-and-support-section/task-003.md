# Task 003 — Support/Donation Section (Ko-fi)

## Goal
Add a "Support" section to the landing page between the Download section and Footer, with a brief message and a Ko-fi button linking externally, so visitors can easily donate.

## Prerequisites
- [x] task-002.md completed

## Tasks

### Components

- [x] `landing/src/components/Support.tsx` — create a new section component with: heading ("Support the Project"), brief description explaining the project is free and donations help fund development, and a styled button/link to `https://ko-fi.com/kentleow` that opens in a new tab with `rel="noopener noreferrer"`; section has `aria-label="Support"` and an `id="support"` anchor; style to match existing section patterns (dark bg, gold accents, centered layout) (new)
- [x] `landing/src/App.tsx` — import and render `<Support />` between `<Download />` and `</main>` closing tag

### Tests

- [x] `landing/src/components/Support.spec.tsx` — test Support component rendering and link behaviour (new)
  - [x] Renders section heading "Support the Project"
  - [x] Ko-fi link has correct href (`https://ko-fi.com/kentleow`)
  - [x] Link opens in new tab (`target="_blank"`)
  - [x] Link has `rel="noopener noreferrer"`
  - [x] Section has `aria-label="Support"`
- [x] `landing/src/App.spec.tsx` — add test verifying Support section renders in the page
  - [x] Support component is rendered between Download and Footer

## Done When
- [x] "Support" section is visible on the landing page after scrolling past Download <!-- verified 2026-06-15 -->
- [x] Ko-fi button links to `https://ko-fi.com/kentleow` in a new tab <!-- verified 2026-06-15 -->
- [x] Section matches existing visual style (dark theme, gold accents) <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
