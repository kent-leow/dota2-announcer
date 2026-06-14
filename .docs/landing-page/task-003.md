# Task 003 — Features Section

## Goal
Implement the features section promoting all app capabilities with icons and descriptions so visitors understand the full value proposition.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Components

- [x] `landing/src/components/Features.tsx` — Grid/card layout showcasing 7 features: real-time voice announcements, dual overlay modes (notification + persistent), 12 configurable game events, TTS customisation (voice/rate/volume), global hotkeys (Ctrl+Shift+M/R), system tray integration, GSI auto-setup. Each feature has an icon (SVG or emoji), title, and short description (new)
  - [x] `landing/src/components/Features.spec.tsx` — Renders all 7 feature cards; each card contains a title and description; responsive grid adapts (1 col mobile, 2 col tablet, 3 col desktop)
- [x] `landing/src/App.tsx` — Import and render Features component after Hero

## Done When
- [x] Features section displays all 7 key features with titles and descriptions <!-- verified 2026-06-15 -->
- [x] Layout is responsive: single column on mobile, multi-column on desktop <!-- verified 2026-06-15 -->
- [x] Feature descriptions match the capabilities described in the desktop app's GuideModal <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
