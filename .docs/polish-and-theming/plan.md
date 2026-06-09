# Polish, Theming & Documentation

## Summary

Bring the Dota 2 Announcer application to release quality by: (1) writing a comprehensive README for developers and end-users, (2) verifying all existing functionality works correctly end-to-end in the code, (3) restyling the entire UI with a modern dark theme inspired by the Dota 2 aesthetic, and (4) adding a visible in-app guide/help panel that teaches users how the app works.

## Scope

**In scope**
- Complete README with installation, dev setup, build, usage, and configuration instructions
- Code audit and fix of all modules to ensure correctness (process detection, game timer, scheduler, TTS, hotkeys, config loader)
- Full UI restyling with a Dota 2-inspired dark theme (colours, typography, layout, custom controls)
- Responsive layout and polished component design for MainDock, UpcomingEvents, EventConfigPanel
- In-app guide panel accessible from the main UI explaining features, hotkeys, and event configuration
- Any missing wiring between UI components and backend modules

**Out of scope**
- Adding new backend features or game events
- CI/CD pipeline setup
- Overlay mode or transparent window
- Mac/Linux support
- Internationalisation

## Acceptance Criteria

| **AC1** | README covers developer and user workflows |
|---------|----|
| Given | a new developer or user clones the repository |
| When | they open README.md |
| Then | they find: project overview, prerequisites, install steps, dev mode command, build/package command, usage instructions, hotkey reference, event config format, and contribution notes |

| **AC2** | All backend modules function correctly |
|---------|----|
| Given | the application source code in its current state |
| When | a code audit reviews process detection, game timer, event scheduler, TTS engine, mute/volume, hotkeys, and config loading |
| Then | all modules compile without errors, existing tests pass, and any logic bugs discovered are fixed |

| **AC3** | UI uses a modern Dota 2-inspired dark theme |
|---------|----|
| Given | the application is running |
| When | the user views any screen (main dock, upcoming events, settings) |
| Then | the UI displays a dark colour palette (blacks, deep greys, gold/amber accents), uses a clean sans-serif or Dota-style font, and all interactive elements (buttons, sliders, tables) are visually consistent with the theme |

| **AC4** | Layout is structured and visually polished |
|---------|----|
| Given | the main application window |
| When | rendered at default size |
| Then | the layout has clear visual sections (header/status, timer display, controls, upcoming events), proper spacing, and readable typography with no unstyled HTML elements |

| **AC5** | In-app guide is accessible and informative |
|---------|----|
| Given | the application is running |
| When | the user clicks a help/guide button or navigates to the guide section |
| Then | a panel or overlay displays: app purpose, how to start/stop the announcer, hotkey reference (Ctrl+Shift+M for mute, Ctrl+Shift+R for reload), how to customise events via JSON, and tips for first-time users |

| **AC6** | Guide integrates visually with the Dota 2 theme |
|---------|----|
| Given | the guide panel is open |
| When | the user reads it |
| Then | it uses the same dark theme, has clear section headings, readable text, and matches the visual style of the rest of the app |

## Resolved Decisions
- **Styling**: Tailwind CSS — utility-first approach with custom Dota 2 colour tokens
- **Guide UI**: Modal overlay — triggered by a help button, dismissible, no layout changes needed

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (12 × 2) + 0 = 24, rounded to nearest Fibonacci = 13. 1 SP = 2 days.

## Notes
- Current UI is entirely unstyled bare HTML — all components need CSS from scratch
- Tailwind CSS will be installed and configured with Vite plugin and custom Dota 2 colour palette (dark blacks, deep greys, gold/amber accents)
- The app uses Electron + React + Vite — Tailwind integrates natively with Vite
- README is effectively empty (just the project name repeated)
- Backend modules appear structurally complete based on git history but need verification
- Guide modal will include: app overview, controls explanation, hotkey reference, event config format
