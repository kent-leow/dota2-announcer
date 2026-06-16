# Event Icons & Default Warning Adjustments

## Summary
Add per-event icon support so each event rule displays a visual icon across all surfaces (overlay notifications, persistent panel, main UI countdown). Users can upload custom icons with a crop/resize step enforcing 64x64 max, or remove them (falling back to a placeholder). Icons are stored as base64 data URIs in the JSON config for simple management. Default events ship with appropriate Dota 2 icons sourced from the Dota 2 wiki. Additionally, change all default warning offsets to 0 seconds so announcements fire at event time rather than pre-announcing, letting users configure their own preferred lead times.

## Scope
**In scope**
- Icon field on event schema (optional, base64 data URI string)
- Placeholder icon asset for new/empty-icon events
- Upload icon flow with crop/resize step (enforces 64x64 output)
- Remove icon action (reverts to placeholder)
- Display icon in: notification overlay card, persistent panel row, main page upcoming events list
- Source and bundle appropriate default icons for all 12 built-in events from Dota 2 wiki (runes, day/night, neutrals, tormentor, shard, siege, flagbearer)
- Change all default event warning offsets to 0
- Store icons as base64 data URIs within events JSON config

**Out of scope**
- Animated/GIF icon support
- Icon packs or theme-based icon sets
- Changing the event schema beyond icon field addition
- Auto-download icons at runtime from external URLs

## Acceptance Criteria

| **AC1** | Event schema supports optional icon field |
|---------|------------------------------------------|
| Given | An event rule definition |
| When  | The event has an `icon` field set to a valid base64 data URI |
| Then  | The system accepts and persists it; Zod validation passes |

| **AC2** | Placeholder icon displayed for events without icon |
|---------|---------------------------------------------------|
| Given | An event with no icon set or icon explicitly removed |
| When  | The event appears in any display surface (overlay, persistent panel, upcoming list) |
| Then  | A generic placeholder icon is shown in place of the event icon |

| **AC3** | User can upload a custom icon with crop/resize |
|---------|------------------------------------------------|
| Given | The event editor/settings UI |
| When  | User clicks upload and selects an image file (PNG/SVG/JPG) |
| Then  | A crop/resize dialog appears, user adjusts to desired area, output is resized to 64x64, saved as base64 in config, and icon displays immediately |

| **AC4** | User can remove a custom icon |
|---------|-------------------------------|
| Given | An event with a custom icon set |
| When  | User clicks the remove/clear icon button |
| Then  | The icon field is removed from event config and placeholder icon is shown |

| **AC5** | Icon displayed in notification overlay |
|---------|----------------------------------------|
| Given | An event fires and notification overlay is enabled |
| When  | The notification card appears |
| Then  | The event icon (or placeholder) is rendered alongside the event name |

| **AC6** | Icon displayed in persistent panel |
|---------|------------------------------------|
| Given | Persistent overlay panel is visible with upcoming events |
| When  | An event row is rendered |
| Then  | The event icon (or placeholder) is rendered to the left of the event name |

| **AC7** | Icon displayed in main page upcoming events |
|---------|---------------------------------------------|
| Given | The main UI upcoming events list is visible |
| When  | An event row is rendered |
| Then  | The event icon (or placeholder) is rendered to the left of the event name |

| **AC8** | Default events ship with appropriate Dota 2 icons |
|---------|---------------------------------------------------|
| Given | A fresh install or default config load |
| When  | Default events are displayed |
| Then  | Each of the 12 default events shows its corresponding Dota 2 icon (bounty rune, power rune, wisdom rune, lotus rune, water rune, day, night, neutral camp, tormentor, aghanim shard, siege creep, flagbearer creep) |

| **AC9** | Default warning offsets are 0 for all events |
|---------|----------------------------------------------|
| Given | Default events configuration |
| When  | The app loads with no user overrides |
| Then  | All 12 default events have `warnings: [{ offsetSeconds: 0 }]` |

| **AC10** | Newly created events get placeholder icon |
|----------|-------------------------------------------|
| Given | User creates a new custom event rule |
| When  | No icon is uploaded during creation |
| Then  | The new event displays the placeholder icon across all surfaces |

| **AC11** | Crop/resize enforces 64x64 maximum dimensions |
|----------|------------------------------------------------|
| Given | User uploads an image larger than 64x64 |
| When  | The crop/resize dialog completes |
| Then  | The resulting icon is exactly 64x64 pixels stored as base64 PNG |

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (11 AC rows × 2) + 0 open questions = 22, rounded to nearest Fibonacci = 21 → adjusted to 13 given moderate per-AC complexity. 1 SP = 2 days.

## Notes
- Base64 at 64x64 PNG is ~5-15KB per icon; 12 defaults ≈ 180KB max in config — sustainable for local JSON.
- Default Dota 2 icons sourced from Dota 2 wiki (no licensing restrictions).
- Icon display size: ~20-24px in overlays, ~16-20px in main UI list (rendered from 64x64 source).
- The icon field in schema is optional — backward compatible with existing user configs (missing field = placeholder).
- Changing default warnings to 0 is a behavior change — note in release changelog.
- Crop/resize can use a lightweight library (e.g. react-image-crop or canvas-based).

## Changelog
- 2026-06-17: Resolved all open questions. Icons stored as base64 in JSON config. Max 64x64 with crop/resize on upload. Dota 2 wiki icons freely usable. Moved crop/resize from out-of-scope to in-scope.
