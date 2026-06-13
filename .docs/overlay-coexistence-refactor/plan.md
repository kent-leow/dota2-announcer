# Overlay Coexistence Refactor

## Summary
Refactor the overlay system so that "notification" and "persistent" overlays can run simultaneously as independent layers rather than as mutually exclusive modes. Each overlay has its own enable/disable toggle, its own position (left or right), and its own configuration (font size, event count, etc.). When both overlays are positioned on the same side, the notification overlay renders below the persistent panel to avoid overlap. Additionally, remove all music and sound effect playback — only TTS announcements remain as audio output.

## Scope
**In scope**
- Both notification and persistent overlays can be active at the same time
- Each overlay has an independent enable/disable toggle
- Each overlay has an independent position setting (left or right)
- Each overlay has its own font size configuration
- Persistent overlay retains its event count configuration
- When both overlays are on the same side, notifications appear below the persistent panel
- When on opposite sides, each occupies its own side independently
- Settings UI updated to configure each overlay individually
- Remove all music/sound effect playback — only TTS remains as audio output
- Remove sound-related settings and UI controls
- Settings apply immediately on change — no "Apply" or "Save" button
- Remove "Reload config" button from main page — config reloads automatically when event timing changes
- Remove non-functional "Start/Stop" button from main page

**Out of scope**
- Additional overlay positions beyond left/right (no top/bottom/center variants)
- Drag-and-drop or pixel-precise overlay positioning
- Adding new overlay types beyond notification and persistent
- Changes to event scheduling logic
- Overlay rendering on secondary monitors
- Notification mode dynamic countdown changes (already implemented)

## Acceptance Criteria

| **AC1** | Independent enable/disable toggles |
|---------|-------------------------------------|
| Given | The user opens overlay settings |
| When  | They toggle the notification overlay enable/disable |
| Then  | Only the notification overlay is affected; persistent overlay state remains unchanged (and vice versa) |

| **AC2** | Both overlays active simultaneously |
|---------|--------------------------------------|
| Given | Both notification and persistent overlays are enabled |
| When  | A match is in progress with scheduled events |
| Then  | Both overlays are visible at the same time — persistent shows upcoming events, notification shows event announcements as they fire |

| **AC3** | Independent position (left/right) per overlay |
|---------|------------------------------------------------|
| Given | The user configures notification overlay to "left" and persistent overlay to "right" |
| When  | Both overlays are active |
| Then  | Notification appears on the left side, persistent appears on the right side |

| **AC4** | Same-side stacking — notification below persistent |
|---------|------------------------------------------------------|
| Given | Both overlays are enabled and configured to the same side |
| When  | Both are visible during a match |
| Then  | The persistent panel occupies the upper portion, and notification cards appear below it without overlap |

| **AC5** | Independent font size per overlay |
|---------|-----------------------------------|
| Given | The user sets different font sizes for notification and persistent overlays |
| When  | Both overlays are rendered |
| Then  | Each uses its own configured font size independently |

| **AC6** | Configuration persists across sessions |
|---------|----------------------------------------|
| Given | The user configures both overlays (enable state, position, font size) |
| When  | The app is restarted |
| Then  | All per-overlay settings are restored to their last saved values |

| **AC7** | Single overlay disabled, other still works |
|---------|---------------------------------------------|
| Given | The user disables the persistent overlay but keeps notification enabled |
| When  | A match is in progress |
| Then  | Only notification overlay is shown; no persistent panel appears (and vice versa) |

| **AC8** | Both overlays disabled |
|---------|------------------------|
| Given | Both overlays are toggled off |
| When  | A match is in progress |
| Then  | No overlay window is shown at all |

| **AC9** | Settings UI reflects individual configuration |
|---------|------------------------------------------------|
| Given | The user opens overlay settings |
| When  | They view the configuration panel |
| Then  | They see separate sections for notification and persistent overlays, each with its own enable toggle, position selector, and font size control |

| **AC10** | Music/sound effects removed |
|----------|------------------------------|
| Given | The app is running |
| When  | Any event fires (warning or spawn) |
| Then  | No music or sound effects play — only TTS announcements are produced as audio |

| **AC11** | Sound settings removed from UI |
|----------|--------------------------------|
| Given | The user opens settings |
| When  | They browse available configuration |
| Then  | There are no music/sound effect controls — only TTS-related audio settings remain |

| **AC12** | Settings apply immediately without save button |
|----------|--------------------------------------------------|
| Given | The user changes any numeric or toggle setting |
| When  | The value changes (e.g., font size, event count, enable toggle) |
| Then  | The change takes effect immediately — no "Apply" or "Save" button exists |

| **AC13** | No reload config button on main page |
|----------|---------------------------------------|
| Given | The user edits event timing configuration |
| When  | They return to the main page |
| Then  | The config is already reloaded/applied — no manual "Reload config" button exists |

| **AC14** | Start/Stop button removed |
|----------|----------------------------|
| Given | The user views the main page |
| When  | The page renders |
| Then  | There is no start/stop button — announcements activate automatically based on game state |

## Open Questions

| # | Question | Impact if unresolved |
|---|----------|----------------------|
| 1 | Should same-side stacking use a fixed offset (persistent height) or dynamically measure the persistent panel's actual rendered height? | Affects whether notifications can clip or leave a gap when event count changes |

## Estimate
**Story Points**: 21 SP (~42 days)
> raw SP = (14 AC × 2) + 1 OQ = 29 → rounded to Fibonacci 21. 1 SP = 2 days.

## Notes
- Currently there is a single `overlayMode` toggle that switches between modes — this must be replaced with two independent enabled flags
- Current state shape: `overlayPosition`, `overlayMode`, `overlayFontSize`, `overlayEventCount` — needs to become per-overlay (e.g., `notification.enabled`, `notification.position`, `persistent.enabled`, `persistent.position`)
- The existing single overlay BrowserWindow may need to be kept as a single window with both components rendered inside (simpler click-through management) OR split into two windows (simpler positioning). Architecture decision during implementation.
- Same-side stacking: the notification stack's top offset should account for persistent panel height when both are on the same side
- Position values simplify from `'left-center' | 'right-center'` to `'left' | 'right'` since vertical positioning is determined by stacking logic
- Sound/music removal: delete audio file assets, sound playback logic, sound toggle state, and related UI — TTS pipeline remains untouched

## Changelog
- 2026-06-14: Added AC10/AC11 — remove music/sound effects, keep only TTS
- 2026-06-14: Added AC12/AC13 — instant-apply settings (no save button), remove reload config button from main page
- 2026-06-14: Added AC14 — remove non-functional start/stop button from main page
