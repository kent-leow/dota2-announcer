import * as fs from 'fs';
import * as path from 'path';

export interface SoundAssignment {
  type: 'bundled' | 'custom';
  filename: string;
}

export type SoundAssignments = Record<string, SoundAssignment>;

function getStorePath(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getPath('userData'), 'sounds.json');
  } catch {
    return path.resolve(process.cwd(), 'config', 'sounds.json');
  }
}

export function readSoundAssignments(): SoundAssignments {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf-8');
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as SoundAssignments;
  } catch {
    return {};
  }
}

export function writeSoundAssignments(assignments: SoundAssignments): void {
  const storePath = getStorePath();
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(storePath, JSON.stringify(assignments, null, 2), 'utf-8');
}

export function assignSound(eventId: string, assignment: SoundAssignment): void {
  const current = readSoundAssignments();
  current[eventId] = assignment;
  writeSoundAssignments(current);
}

export function removeSound(eventId: string): void {
  const current = readSoundAssignments();
  delete current[eventId];
  writeSoundAssignments(current);
}

const DEFAULT_SOUND_MAP: SoundAssignments = {
  'bounty-rune': { type: 'bundled', filename: 'bounty-rune.wav' },
  'water-rune': { type: 'bundled', filename: 'water-rune.wav' },
  'power-rune': { type: 'bundled', filename: 'power-rune.wav' },
  'wisdom-rune': { type: 'bundled', filename: 'wisdom-rune.wav' },
  'lotus-rune': { type: 'bundled', filename: 'lotus-rune.wav' },
  'night': { type: 'bundled', filename: 'night.wav' },
  'day': { type: 'bundled', filename: 'day.wav' },
  'neutral-camp': { type: 'bundled', filename: 'neutral-camp.wav' },
  'tormentor': { type: 'bundled', filename: 'tormentor.wav' },
  'aghanim-shard': { type: 'bundled', filename: 'aghanim-shard.wav' },
  'siege-creep': { type: 'bundled', filename: 'siege-creep.wav' },
  'flagbearer-creep': { type: 'bundled', filename: 'flagbearer-creep.wav' },
};

export function getDefaultSoundMap(): SoundAssignments {
  return { ...DEFAULT_SOUND_MAP };
}

export function getSoundForEvent(eventId: string): SoundAssignment | null {
  const assignments = readSoundAssignments();
  if (assignments[eventId]) return assignments[eventId];
  return DEFAULT_SOUND_MAP[eventId] ?? null;
}
