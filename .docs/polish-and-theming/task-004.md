# Task 004 — In-App Guide Modal

## Goal
Add a help button to the main UI that opens a themed modal overlay containing a user guide with app instructions, hotkey reference, and event configuration help.

## Prerequisites
- [x] task-003.md completed

## Tasks

### Guide Component

- [x] `src/ui/guide/GuideModal.tsx` — create modal overlay component with backdrop, close button, and guide content sections: Overview, Controls, Hotkeys, Event Configuration (new)
  - [x] `src/ui/guide/GuideModal.spec.tsx` — verify modal renders when open, closes on button click, displays all sections (new)

### Integration

- [x] `src/renderer/App.tsx` — add help button (e.g. "?" icon) in header that toggles GuideModal visibility
  - [x] `src/renderer/App.spec.tsx` — verify help button renders, clicking it shows GuideModal, closing hides it

### Content & Styling

- [x] `src/ui/guide/GuideModal.tsx` — style with Tailwind: dark backdrop with opacity, modal card with `dota-dark` background, `dota-gold` headings, `dota-grey` body text, sections separated by dividers
  - Guide sections:
    - **Overview**: what the app does (auto-detect Dota 2, announce events via TTS)
    - **Controls**: Mute/Unmute, Volume slider, Start/Stop announcer, Reload Config
    - **Hotkeys**: Ctrl+Shift+M (toggle mute), Ctrl+Shift+R (reload config)
    - **Event Configuration**: where to find events.json, format explanation (id, name, spawnTime, repeatEvery, warnings)

## Done When
- [x] Help button visible in app header <!-- verified 2026-06-10 -->
- [x] Clicking help button opens modal overlay with dark Dota 2 theme <!-- verified 2026-06-10 -->
- [x] Modal contains all four guide sections with accurate content <!-- verified 2026-06-10 -->
- [x] Modal can be closed via close button or backdrop click <!-- verified 2026-06-10 -->
- [x] Guide text is readable and visually consistent with app theme <!-- verified 2026-06-10 -->
- [x] All tests pass <!-- verified 2026-06-10 -->
