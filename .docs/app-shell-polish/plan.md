# App Shell Polish — Persistence, Menu, Tray & Docs

## Summary
Improve the application shell experience: fix user data persistence so event configuration survives app updates, add a proper application menu bar tailored to the Dota 2 announcer use case, give users control over close-to-tray behavior with a confirmation dialog, update the in-app User Guide to reflect current features, and create an AGENTREADME.md for developer/agent onboarding.

## Scope
**In scope**
- Relocate events config persistence from app resources to user data directory
- First-run migration: copy bundled defaults to user data if no config exists
- Add an application menu bar with relevant items (replacing default Electron menu)
- Close-to-tray confirmation dialog with "don't ask me again" option
- Preference to reset "don't ask me again" accessible from menu
- Update User Guide modal content to match current application features
- Create AGENTREADME.md at project root with project overview, architecture, and theming info

**Out of scope**
- Auto-updater implementation
- Cloud sync of user config
- Multi-language support for menu/guide
- Redesigning the tray icon or tray context menu beyond adding a preference reset option

## Acceptance Criteria

| **AC1** | Events config persists in user data directory |
|---------|----------------------------------------------|
| Given | The app is packaged and installed on Windows |
| When  | The user modifies event timing via the UI |
| Then  | Changes are saved to `%APPDATA%/<app-name>/config/events.json`, not inside app resources |

| **AC2** | First-run default migration |
|---------|----------------------------|
| Given | The app is launched for the first time (no events.json in userData) |
| When  | The app starts |
| Then  | The bundled default events.json is copied to the userData config directory |

| **AC3** | Config survives app update |
|---------|---------------------------|
| Given | The user has customized events and installs a new app version |
| When  | The new version launches |
| Then  | The user's customized events.json in userData is preserved and loaded |

| **AC4** | Application menu bar is relevant |
|---------|----------------------------------|
| Given | The app is running |
| When  | The user views the menu bar |
| Then  | Menu contains only items relevant to the announcer app (no generic Edit/text-editing items that don't apply) |

| **AC5** | Menu bar provides essential actions |
|---------|-------------------------------------|
| Given | The app is running |
| When  | The user opens the menu |
| Then  | They can access: Quit, Reload Config, Open User Guide, Toggle Overlay, Preferences/Settings, and About |

| **AC6** | Close button shows confirmation dialog |
|---------|----------------------------------------|
| Given | The user has not set "don't ask me again" |
| When  | They click the window close button (X) |
| Then  | A dialog appears asking whether to minimize to tray or quit, with a "don't ask me again" checkbox |

| **AC7** | "Don't ask me again" persists the choice |
|---------|------------------------------------------|
| Given | The user checks "don't ask me again" and selects minimize |
| When  | They click X on subsequent launches |
| Then  | The app silently minimizes to tray without showing the dialog |

| **AC8** | Close preference is resettable |
|---------|-------------------------------|
| Given | The user previously set "don't ask me again" |
| When  | They access the reset option from the menu bar (e.g. Preferences > Reset close behavior) |
| Then  | The next X click shows the confirmation dialog again |

| **AC9** | User Guide reflects current features |
|---------|--------------------------------------|
| Given | The app is running |
| When  | The user opens the User Guide |
| Then  | Content accurately describes current controls, hotkeys, overlay features, event configuration, and sound settings |

| **AC10** | AGENTREADME.md provides project context |
|----------|------------------------------------------|
| Given | A developer or AI agent opens the project |
| When  | They read AGENTREADME.md |
| Then  | They understand the project purpose, tech stack, architecture, theming/colors, and how to get started |

## Resolved Decisions

1. **Menu structure** (decided):
   - **File**: Reload Config, Separator, Quit
   - **View**: Toggle Overlay, Toggle DevTools (dev only)
   - **Settings**: Reset Close Behavior
   - **Help**: User Guide, Separator, About
   - No Edit or Window menus — not applicable to this app.

2. **Close dialog style** (decided): Native Electron `dialog.showMessageBox` with checkbox — fits the OS-native tray interaction pattern, no custom UI needed for a system-level decision.

3. **Preference storage** (decided): `preferences.json` in `app.getPath('userData')` — persists across sessions and reinstalls (same userData directory as events.json). Simple JSON file, no external dependency needed.

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (10 AC × 2) = 20, rounded to nearest Fibonacci = 21 → adjusted to 13 given moderate complexity per item. 1 SP = 2 days.

## Notes
- The app already has minimize-to-tray behavior (hides window on close, `isQuitting` flag for actual quit). The dialog adds user choice on top of existing logic.
- No traditional menu bar exists currently — only a tray context menu with Show/Quit. This is a net-new addition.
- The User Guide is a React modal (`GuideModal.tsx`) — content update is in-place.
- Events persistence fix is the highest-priority item as it's a bug (data loss on update).
- Preferences stored in userData survive reinstalls on Windows (`%APPDATA%` is not wiped by uninstaller by default).

## Changelog
- 2026-06-14: Resolved all 3 open questions — menu structure, dialog style, preference storage decided.
