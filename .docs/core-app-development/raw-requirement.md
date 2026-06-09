# Project: Dota 2 In-Game Event Voice Announcer (Windows Desktop App)

## Objective

Create a lightweight Windows desktop application that announces important Dota 2 game timings using text-to-speech (TTS).

The application should automatically detect when a Dota 2 match starts, begin tracking game time from 0:00, and announce upcoming objectives/events before they occur.

This is a hobby project. Prioritize simplicity and functionality over enterprise-level architecture, testing, CI/CD, or code quality requirements.

---

## Technology Stack

### Preferred

* Electron
* React
* TypeScript

### Alternative (recommended if lighter)

Evaluate whether Tauri + React + TypeScript is a better choice due to:

* Lower memory usage
* Faster startup
* Smaller executable size

Use whichever stack results in the simplest implementation while remaining easy to maintain.

---

## Core Features

### 1. Dota 2 Process Detection

Detect whether Dota 2 is currently running.

Possible methods:

* Detect `dota2.exe`
* Read Dota 2 Game State Integration (GSI)
* Any reliable local approach

Requirements:

* Automatically start timer when a match begins
* Automatically stop timer when match ends
* Reset timer for next match
* No manual start button required

---

### 2. Game Timer

Maintain an internal game clock.

Example:

```text
00:00
00:01
00:02
...
```

The timer must represent actual in-game elapsed time.

---

### 3. Event Announcement System

All event timings must be configurable via JSON.

Example:

```json
{
  "events": [
    {
      "name": "Power Rune",
      "spawnTime": 360,
      "warningBefore": 30,
      "message": "Power rune spawning in 30 seconds"
    },
    {
      "name": "Lotus Pool",
      "spawnTime": 180,
      "warningBefore": 15,
      "message": "Lotus spawning in 15 seconds"
    }
  ]
}
```

The application should load and use this configuration dynamically.

Future Dota patches should only require updating the JSON file.

No code changes should be needed.

---

### 4. Text-To-Speech Announcer

Requirements:

* Offline TTS preferred
* Windows built-in Speech API is acceptable
* Voice should be clear and low latency

Examples:

```text
Power rune spawning in 30 seconds.
Lotus spawning in 15 seconds.
Wisdom rune spawning in 20 seconds.
Night time in 10 seconds.
Neutral camps respawning in 5 seconds.
```

Prevent duplicate announcements.

---

### 5. Supported Dota Events

Initial event list should include:

#### Rune Timings

* Bounty Rune
* Water Rune
* Power Rune
* Wisdom Rune

#### Lotus Pool

* Lotus spawn

#### Day/Night Cycle

* First night
* Subsequent transitions

#### Neutral Camps

* Neutral camp respawn reminders

#### Tormentor

* Tormentor spawn

#### Roshan

* Roshan reminder timings

#### Outpost Related Events

If applicable in current patch.

The event system should allow adding future objectives without code changes.

---

### 6. Warning Offsets

Each event can have custom warning timings.

Examples:

| Event           | Warning |
| --------------- | ------- |
| Power Rune      | 30 sec  |
| Lotus           | 15 sec  |
| Wisdom Rune     | 20 sec  |
| Neutral Respawn | 5 sec   |
| Night Time      | 10 sec  |

Multiple warnings should be supported.

Example:

```json
{
  "name": "Roshan",
  "spawnTime": 1200,
  "warnings": [60, 30, 10]
}
```

Announcements:

```text
Roshan event in 60 seconds.
Roshan event in 30 seconds.
Roshan event in 10 seconds.
```

---

## User Interface

Keep UI extremely simple.

### Main Screen

Show:

```text
Dota Status:
✓ In Match

Game Time:
23:41
```

### Upcoming Events

```text
Next Events

24:00 Power Rune
24:00 Neutral Respawn
27:00 Lotus
```

### Controls

* Mute
* Volume slider
* Start/Stop announcer
* Reload configuration

---

## Configuration

Store settings in:

```text
config/events.json
```

Example:

```json
{
  "events": [
    {
      "id": "power-rune",
      "repeatEvery": 120,
      "firstOccurrence": 360,
      "warnings": [30]
    }
  ]
}
```

Support:

* One-time events
* Repeating events
* Multiple warnings

---

## Architecture

Suggested structure:

```text
src/

├─ app/
├─ timer/
├─ dota/
│  ├─ processDetector.ts
│  ├─ gsiListener.ts
│
├─ announcer/
│  ├─ tts.ts
│
├─ scheduler/
│  ├─ eventScheduler.ts
│
├─ config/
│  ├─ events.json
│
└─ ui/
```

---

## Nice-To-Have Features

### Overlay Mode

Optional transparent overlay showing:

```text
Power Rune: 00:24
Lotus: 02:11
Wisdom Rune: 05:33
```

---

### Global Hotkeys

Examples:

```text
Ctrl+Shift+M
Mute announcer

Ctrl+Shift+R
Reload config
```

---

### Patch Updates

Allow downloading newer timing JSON files from GitHub without requiring a full application update.

---

## Deliverables

1. Working Windows desktop application
2. Auto-detect Dota 2 match start/end
3. Voice announcements
4. Configurable event system via JSON
5. Simple UI showing current game timer and upcoming events
6. Build instructions
7. Windows executable release build

Do not spend effort on:

* Unit tests
* Integration tests
* CI/CD
* Telemetry
* Authentication
* Cloud services

Focus on delivering a functional local desktop utility.
