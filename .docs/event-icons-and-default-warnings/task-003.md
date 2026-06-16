# Task 003 — Icon Upload with Crop/Resize & Remove

## Goal
Users can upload a custom icon (with crop/resize to 64x64) for any event, and remove it to revert to placeholder. Verifiable by uploading an image in event settings, seeing it crop, then seeing the icon appear across all surfaces.

## Prerequisites
- [x] task-002.md completed

## Tasks

### Dependency

- [x] `application/package.json` — No external dependency needed; implemented with canvas-only approach

### Icon Crop/Resize Component

- [x] `application/src/ui/settings/IconCropDialog.tsx` — Modal dialog: accepts image File input, shows crop UI (square aspect ratio enforced), on confirm uses canvas to resize cropped area to 64x64, outputs base64 PNG data URI via callback (new)
  - [x] `application/src/ui/settings/IconCropDialog.spec.tsx` — Renders crop area when image provided; calls onConfirm with base64 data URI; calls onCancel when dismissed; enforces square aspect ratio (new)

### Event Config Panel Integration

- [x] `application/src/ui/settings/EventConfigPanel.tsx` — Add icon column to event table showing current icon (or placeholder); add upload button (opens file picker → IconCropDialog); add remove button (clears icon field); on add-event form, show placeholder icon with optional upload; save icon field via `electronAPI.saveEvents`
  - [x] `application/src/ui/settings/EventConfigPanel.spec.tsx` — Icon column renders for each event; upload button triggers file input; remove button clears icon and shows placeholder; new event saves without icon field (placeholder shown)

### IPC Handler (icon in save payload)

- [x] `application/src/main/ipcHandlers.ts` — No logic changes needed; icon field passes through existing `config:saveEvents` handler as part of event schema (already optional string)

### Placeholder Helper

- [x] `application/src/config/defaultIcons.ts` — Export `PLACEHOLDER_ICON` constant separately for easy import by UI components
  - [x] (covered by task-001 tests)

## Done When
- [x] User can click upload on any event row, select an image, crop/resize it, and see 64x64 icon saved <!-- verified 2026-06-17 -->
- [x] Crop dialog enforces square aspect ratio and outputs exactly 64x64 PNG <!-- verified 2026-06-17 -->
- [x] User can remove an icon and event reverts to placeholder <!-- verified 2026-06-17 -->
- [x] New events created without uploading show placeholder icon <!-- verified 2026-06-17 -->
- [x] Icon persists in events.json config across app restarts <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
