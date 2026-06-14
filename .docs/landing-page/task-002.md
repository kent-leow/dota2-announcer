# Task 002 — Hero Section with Video Showcase

## Goal
Implement the hero section with Dota 2 official video background, app title, tagline, and download CTA so visitors immediately understand the product.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Components

- [x] `landing/src/components/Hero.tsx` — Full-viewport hero with `<video autoplay muted loop playsinline>` containing WebM and MP4 sources from Steam CDN; overlay with app title "Dota 2 Announcer", tagline, and "Download" button linking to GitHub Releases latest (new)
  - [x] `landing/src/components/Hero.spec.tsx` — Renders video element with correct `src` attributes; renders title text; download link points to `https://github.com/kent-leow/dota2-announcer/releases/latest`; video has `autoplay`, `muted`, `loop` attributes
- [x] `landing/src/App.tsx` — Import and render Hero component in main slot

## Done When
- [x] Hero section fills viewport height with video playing in background <!-- verified 2026-06-15 -->
- [x] Video element has two `<source>` children: WebM and MP4 from `cdn.steamstatic.com` <!-- verified 2026-06-15 -->
- [x] App title and tagline are visible overlaid on video <!-- verified 2026-06-15 -->
- [x] Download button links to `https://github.com/kent-leow/dota2-announcer/releases/latest` <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
