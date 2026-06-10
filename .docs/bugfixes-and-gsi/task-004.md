# Task 004 — Themed Scrollbar & GSI Setup Guide

## Goal
Style all scrollbars to match the Dota 2 dark theme, and add GSI setup instructions to the in-app guide so users know how to install the config file.

## Prerequisites
- [x] task-001.md completed (GSI config file must exist to reference)

## Tasks

### Scrollbar Styling

- [x] `src/renderer/index.css` — add `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, `::-webkit-scrollbar-thumb` rules using Dota theme colours (dark track, gold/amber thumb, rounded corners)

### Guide Content Update

- [x] `src/ui/guide/GuideModal.tsx` — add a "GSI Setup" section explaining: where to find the config file in the app, where to copy it in the Dota 2 directory (`steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration/`), and that Dota 2 must be restarted after placing it
  - [x] `src/ui/guide/GuideModal.spec.tsx` — verify GSI setup section renders with path instructions and restart note

## Done When
- [x] Scrollbars in all scrollable areas (upcoming events, settings panel) use dark track + gold thumb <!-- verified 2026-06-10 -->
- [x] No default browser scrollbar appearance visible <!-- verified 2026-06-10 -->
- [x] Guide modal contains clear GSI config installation instructions <!-- verified 2026-06-10 -->
- [x] All new and modified tests pass <!-- verified 2026-06-10 -->
- [x] No existing tests broken <!-- verified 2026-06-10 -->
