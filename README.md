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

## Project Structure

```
src/
├── config/       Event schema, loader, and default timings
├── dota/         Process detection (dota2.exe polling)
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
