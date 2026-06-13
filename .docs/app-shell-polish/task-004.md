# Task 004 — Update User Guide Content

## Goal
Update the GuideModal content to accurately reflect all current application features including overlay modes, sound settings, GSI integration, and event configuration via UI.

## Prerequisites
- None (can be done in parallel with other tasks)

## Tasks

### UI Layer

- [x] `src/ui/guide/GuideModal.tsx` — Rewrite content sections to cover: Overview (with overlay mention), Controls (mute, volume, rate, voice selection, time suffix toggle), Hotkeys (current bindings), Overlay Settings (notification mode, persistent mode, position, font size, event count), Event Configuration (UI-based editing, timing, sounds, enable/disable), GSI Setup (install/uninstall integration), Close-to-Tray behavior
  - [x] `src/ui/guide/GuideModal.spec.tsx` — Test: all section headings render; modal opens/closes correctly; content mentions overlay, GSI, and event configuration sections

## Done When
- [x] User Guide accurately describes all current features <!-- verified 2026-06-14 -->
- [x] No references to outdated config/events.json manual editing as primary method <!-- verified 2026-06-14 -->
- [x] Overlay modes (notification + persistent) documented <!-- verified 2026-06-14 -->
- [x] GSI integration mentioned <!-- verified 2026-06-14 -->
- [x] Sound settings (voice, rate, volume) documented <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
