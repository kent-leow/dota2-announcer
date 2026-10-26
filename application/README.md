# Dota 2 Announcer

A desktop voice-timer app that auto-detects Dota 2 and announces upcoming game events via text-to-speech.

## Features

- Automatic Dota 2 process detection (starts/stops with the game)
- Real-time game timer with MM:SS display
- Text-to-speech announcements before key events (runes, camps, day/night, Roshan, Tormentor)
- Configurable event timings via JSON
- Mute/volume controls with global hotkeys
- Dark Dota 2-themed UI with in-app guide

## Prerequisites

- Node.js 18+
- npm 9+
- Windows (process detection uses `tasklist`)

## Installation

```bash
git clone <repo-url> dota2-announcer
cd dota2-announcer
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server and launches the Electron window with hot reload.

## Build

```bash
npm run build
```

Produces a packaged Electron executable in the `build/` directory via electron-builder.

## Usage

1. Launch the app — it begins polling for `dota2.exe`
2. When Dota 2 is detected, the timer starts and events are scheduled
3. Voice announcements fire at configured warning offsets before each event
4. Use the controls to mute, adjust volume, or reload the event config

## Hotkeys

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+M` | Toggle mute |
| `Ctrl+Shift+R` | Reload event configuration |

## Event Configuration

Events are defined in `config/events.json`. If the file is missing or invalid, built-in defaults are used.

### Format

```json
{
  "events": [
    {
      "id": "bounty-rune",
      "name": "Bounty Rune",
      "spawnTime": 0,
      "repeatEvery": 180,
      "warnings": [
        { "offsetSeconds": 60 },
        { "offsetSeconds": 30 }
      ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique event identifier |
| `name` | string | Display name (spoken in announcements) |
| `spawnTime` | number | Seconds into the game when the event first occurs |
| `repeatEvery` | number? | Seconds between repetitions (omit for one-time events) |
| `warnings` | array? | Offsets (in seconds) before spawn to announce |

To apply changes, press **Ctrl+Shift+R** or click **Reload Config** in the UI.

## Map Awareness

Warns a few seconds before a visible enemy, or one that just vanished into fog, can reach your hero (e.g. "Tidehunter, 5 seconds"). It uses only what your team can already see on the minimap. Configure it under **Settings → Dynamic Events (GSI) → Map Awareness**: visible/fog toggles, warn-before seconds, engage distance and how long to track an enemy in fog. Blink, teleports and invisibility used in fog can arrive earlier than predicted.

### Tuning with recorded matches

1. Enable **Record matches** in the same settings section. Each match is saved as a gzipped file in the app's `recordings` folder (personal IDs stripped, newest 20 kept). **Open recordings folder** shows it.
2. Play at least 5 matches.
3. Run the replay report:
   ```bash
   MAP_AWARENESS_RECORDINGS=<recordings folder> npm run replay:report
   ```
   This replays every recording through the warning engine, checks that replay reproduces the live warnings exactly, and writes `accuracy-report.md` into the folder. The run fails unless ≥ 80% of walking arrivals were warned with ≥ 3 s notice and the median visible ETA error is ≤ 1.5 s.
4. Tune the values in `src/dota/mapAwareness/constants.ts` using the misses and false warnings listed in the report, then re-run.

## Project Structure

```
src/
├── config/       Event schema, loader, and default timings
├── dota/         Process detection, GSI server/parser, Roshan + map-awareness trackers, match recorder
│   └── mapAwareness/  Enemy arrival-time engine (tracks, speed, ETA, warning policy, replay, accuracy)
├── hotkeys/      Global keyboard shortcuts
├── main/         Electron main process
├── renderer/     React entry point and app shell
├── scheduler/    Event scheduling and deduplication
├── timer/        Game timer (start/stop/tick)
├── tts/          Text-to-speech engine, mute, and volume
└── ui/           React components (MainDock, UpcomingEvents, Guide, Settings)
```

## Contributing

```bash
npm test          # Run all tests
npm run test:watch # Watch mode
```

- Follow existing code conventions (TypeScript strict, functional modules)
- Add tests for new functionality
- Keep event config backward-compatible

## License

MIT
