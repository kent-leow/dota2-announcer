# Task 004 — Download Section and Footer

## Goal
Implement the download section with platform-specific CTAs and a page footer so visitors can get the app and see project info.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Components

- [x] `landing/src/components/Download.tsx` — Download section with heading, brief install instructions, and a prominent CTA button linking to `https://github.com/kent-leow/dota2-announcer/releases/latest`; mention Windows and macOS support; styled with Dota 2 gold accent (new)
  - [x] `landing/src/components/Download.spec.tsx` — Renders download heading; CTA link has correct href and opens in new tab (`target="_blank"`); mentions both Windows and macOS
- [x] `landing/src/components/Footer.tsx` — Minimal footer with copyright, GitHub repo link, version (new)
  - [x] `landing/src/components/Footer.spec.tsx` — Renders copyright text; GitHub link points to repo
- [x] `landing/src/App.tsx` — Import and render Download and Footer components after Features

## Done When
- [x] Download section is visible with clear CTA linking to GitHub Releases <!-- verified 2026-06-15 -->
- [x] Footer displays at page bottom with repo link <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
