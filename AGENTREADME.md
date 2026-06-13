# Dota 2 Announcer — Agent README

## Abstract

Desktop application that announces upcoming Dota 2 game events via text-to-speech and an in-game overlay. Connects to Dota 2 through Game State Integration (GSI) to detect match state, track game clock, and trigger voice/visual alerts before events like rune spawns, neutral camps, and day/night transitions.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Electron | 33.2.1 |
| Bundler | Vite + vite-plugin-electron | 6.0.3 |
| Frontend | React + TypeScript | 18.3.1 / 5.7.2 |
| Styling | Tailwind CSS | 3.4.x |
| Validation | Zod | 3.23.8 |
| Testing | Jest + Testing Library | 29.7.0 |
| Packaging | electron-builder | 25.1.8 |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Main Process                        │
│                                                       │
│  GSI Server ─→ Match State Manager ─→ Game Timer     │
│                       │                    │          │
│                       ▼                    ▼          │
│              Phase Detection        Event Scheduler   │
│                       │                    │          │
│                       ▼                    ▼          │
│               IPC Handlers ←──── TTS Announcer       │
│                    │    │                             │
│                    ▼    ▼                             │
│           Main Window    Overlay Window               │
└─────────────────────────────────────────────────────┘
```

### Main Process (`src/main/`)
- `main.ts` — App lifecycle, window creation, tray, menu
- `ipcHandlers.ts` — IPC bridge between main/renderer
- `overlayWindow.ts` — Transparent always-on-top overlay
- `appMenu.ts` — Application menu bar
- `preload.ts` / `overlayPreload.ts` — Context bridge

### Dota Integration (`src/dota/`)
- `gsiServer.ts` — HTTP server receiving Dota 2 game state
- `matchStateManager.ts` — Phase detection (idle/in-match)
- `processDetector.ts` — Dota 2 process detection

### Core Logic
- `src/timer/gameTimer.ts` — Game clock tracking
- `src/scheduler/eventScheduler.ts` — Event timing + warning triggers
- `src/tts/announcer.ts` — TTS voice announcement
- `src/tts/muteManager.ts` / `volumeController.ts` — Audio controls
- `src/tts/stateStore.ts` — Persisted app state (userData)

### Configuration (`src/config/`)
- `eventsLoader.ts` — Load/save events from userData
- `events.schema.ts` — Zod schema for event config
- `defaults.ts` — Default event definitions
- `preferences.ts` — User preferences (close behavior)

### UI (`src/ui/`, `src/renderer/`)
- `src/renderer/App.tsx` — Root React app
- `src/ui/main/` — Main dock, game status panel
- `src/ui/settings/` — Event config, timing, overlay settings
- `src/ui/guide/` — User guide modal

### Overlay (`src/overlay/`)
- Separate renderer for the transparent overlay window
- Notification mode (pop-up alerts) + persistent mode (countdown list)

## Data Flow

1. Dota 2 sends game state to GSI server (HTTP POST)
2. `matchStateManager` detects phase transitions (idle → in-match)
3. `gameTimer` tracks elapsed game time from clock data
4. `eventScheduler` computes upcoming event occurrences
5. `announcer` fires TTS warnings at configured offsets
6. `overlayNotifier` sends events to overlay window via IPC
7. Renderer shows controls/status; overlay shows timers

## Theming / Colors

Tailwind CSS custom palette (dark gaming aesthetic):

| Token | Hex | Usage |
|-------|-----|-------|
| `dota-black` | `#0d0d0d` | Deepest backgrounds |
| `dota-dark` | `#1a1a2e` | Card/modal backgrounds |
| `dota-grey` | `#a0a0b0` | Body text |
| `dota-gold` | `#c9a83e` | Headings, accents, borders |
| `dota-amber` | `#e8b84b` | Highlights, code, emphasis |

Window background: `#0d1117`. All UI uses these tokens via Tailwind classes (`text-dota-gold`, `bg-dota-dark`, `border-dota-gold/30`).

## Folder Structure

```
├── assets/              # App icons, tray icons
├── config/              # Bundled default events.json, GSI cfg
├── src/
│   ├── config/          # Event loading, schema, preferences
│   ├── dota/            # GSI server, match state, process detection
│   ├── hotkeys/         # Global keyboard shortcuts
│   ├── main/            # Electron main process
│   ├── overlay/         # Overlay renderer (separate window)
│   ├── renderer/        # Main renderer entry + App
│   ├── scheduler/       # Event timing logic
│   ├── timer/           # Game clock
│   ├── tracker/         # Game status tracking
│   ├── tts/             # Text-to-speech, volume, mute
│   └── ui/              # React UI components
├── .docs/               # Development plans and task docs
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (renderer hot-reload) |
| `npm run start` | Build + run Electron locally |
| `npm run build` | Full production build with electron-builder |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Watch mode testing |

## Conventions

- Tests live alongside source: `foo.ts` → `foo.spec.ts`
- Electron mocks in tests use `jest.mock('electron', ...)`
- IPC pattern: `ipcMain.handle('domain:action')` / `ipcRenderer.invoke('domain:action')`
- State persistence: JSON files in `app.getPath('userData')`
- All file modules export named functions (no default exports)
