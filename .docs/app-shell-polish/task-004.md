# Task 004 — Update User Guide Content

## Goal
Update the GuideModal content to accurately reflect all current application features including overlay modes, sound settings, GSI integration, and event configuration via UI.

## Prerequisites
- None (can be done in parallel with other tasks)

## Tasks

### UI Layer

- [ ] `src/ui/guide/GuideModal.tsx` — Rewrite content sections to cover: Overview (with overlay mention), Controls (mute, volume, rate, voice selection, time suffix toggle), Hotkeys (current bindings), Overlay Settings (notification mode, persistent mode, position, font size, event count), Event Configuration (UI-based editing, timing, sounds, enable/disable), GSI Setup (install/uninstall integration), Close-to-Tray behavior
  - [ ] `src/ui/guide/GuideModal.spec.tsx` — Test: all section headings render; modal opens/closes correctly; content mentions overlay, GSI, and event configuration sections

## Done When
- [ ] User Guide accurately describes all current features
- [ ] No references to outdated config/events.json manual editing as primary method
- [ ] Overlay modes (notification + persistent) documented
- [ ] GSI integration mentioned
- [ ] Sound settings (voice, rate, volume) documented
- [ ] All new and modified tests pass
- [ ] No existing tests broken
