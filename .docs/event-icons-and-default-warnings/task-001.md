# Task 001 — Schema, Defaults & Icon Infrastructure

## Goal
Add `icon` field to the event schema, change all default warnings to 0, create placeholder icon asset, and embed base64 default icons for all 12 built-in events. Verifiable by loading the app and seeing default events render with icons.

## Prerequisites
- None

## Tasks

### Schema & Validation

- [x] `application/src/config/events.schema.ts` — Add optional `icon` field (z.string().optional()) to eventSchema
  - [x] `application/src/config/events.schema.spec.ts` — Validates with/without icon field; rejects non-string icon values

### Default Icons Asset

- [x] `application/assets/icons/placeholder.png` — Create a generic 64x64 placeholder icon (simple Dota-themed silhouette) (new)
- [x] `application/src/config/defaultIcons.ts` — Export base64 data URI constants for all 12 default event icons + placeholder; icons sourced from Dota 2 wiki and converted to 64x64 base64 PNG (new)
  - [x] `application/src/config/defaultIcons.spec.ts` — Each exported constant is a valid data URI string starting with `data:image/` (new)

### Defaults Configuration

- [x] `application/src/config/defaults.ts` — Change all `warnings` arrays to `[{ offsetSeconds: 0 }]`; add `icon` field to each event referencing the corresponding constant from `defaultIcons.ts`
  - [x] `application/src/config/defaults.spec.ts` — All 12 events have `warnings: [{ offsetSeconds: 0 }]`; all 12 events have a truthy `icon` field

### Events Loader

- [x] `application/src/config/eventsLoader.ts` — No logic changes needed; icon field passes through as optional string. Verify backward compat with configs missing `icon`
  - [x] `application/src/config/eventsLoader.spec.ts` — Loading config without icon field succeeds; loading config with icon field persists it through save/load cycle

## Done When
- [x] Event schema accepts optional `icon` string field <!-- verified 2026-06-17 -->
- [x] All 12 default events have `warnings: [{ offsetSeconds: 0 }]` <!-- verified 2026-06-17 -->
- [x] All 12 default events have an `icon` field with base64 data URI <!-- verified 2026-06-17 -->
- [x] Placeholder icon asset exists at `assets/icons/placeholder.png` <!-- verified 2026-06-17 -->
- [x] Configs without `icon` field still load without validation errors <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
