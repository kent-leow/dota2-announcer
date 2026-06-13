import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'soundstore-test');

jest.mock('electron', () => ({
  app: { getPath: () => path.join(os.tmpdir(), 'soundstore-test') },
}));

import {
  readSoundAssignments,
  writeSoundAssignments,
  assignSound,
  removeSound,
  getSoundForEvent,
  getDefaultSoundMap,
} from './soundStore';

describe('soundStore', () => {
  const storePath = path.join(TEST_DIR, 'sounds.json');

  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  beforeEach(() => {
    try { fs.unlinkSync(storePath); } catch {}
  });

  afterAll(() => {
    try { fs.rmSync(TEST_DIR, { recursive: true }); } catch {}
  });

  it('returns empty object when no file exists', () => {
    expect(readSoundAssignments()).toEqual({});
  });

  it('writes and reads assignments', () => {
    const assignments = { 'bounty-rune': { type: 'bundled' as const, filename: 'bounty-rune.mp3' } };
    writeSoundAssignments(assignments);
    expect(readSoundAssignments()).toEqual(assignments);
  });

  it('assignSound adds to existing assignments', () => {
    assignSound('bounty-rune', { type: 'bundled', filename: 'bounty-rune.mp3' });
    assignSound('lotus-rune', { type: 'custom', filename: 'my-lotus.wav' });
    const result = readSoundAssignments();
    expect(result['bounty-rune']).toEqual({ type: 'bundled', filename: 'bounty-rune.mp3' });
    expect(result['lotus-rune']).toEqual({ type: 'custom', filename: 'my-lotus.wav' });
  });

  it('removeSound deletes custom assignment and falls back to default', () => {
    assignSound('bounty-rune', { type: 'custom', filename: 'custom-coin.mp3' });
    removeSound('bounty-rune');
    const result = getSoundForEvent('bounty-rune');
    expect(result).toEqual({ type: 'bundled', filename: 'bounty-rune.wav' });
  });

  it('removeSound on event with no default returns null', () => {
    assignSound('custom-event', { type: 'custom', filename: 'custom.mp3' });
    removeSound('custom-event');
    expect(getSoundForEvent('custom-event')).toBeNull();
  });

  it('getSoundForEvent returns default for known event with no custom', () => {
    expect(getSoundForEvent('bounty-rune')).toEqual({ type: 'bundled', filename: 'bounty-rune.wav' });
  });

  it('getSoundForEvent returns null for unknown event', () => {
    expect(getSoundForEvent('nonexistent')).toBeNull();
  });

  it('handles corrupted JSON gracefully', () => {
    fs.writeFileSync(storePath, 'not json', 'utf-8');
    expect(readSoundAssignments()).toEqual({});
  });

  it('getDefaultSoundMap returns bundled mappings for all default events', () => {
    const defaults = getDefaultSoundMap();
    const expectedIds = [
      'bounty-rune', 'water-rune', 'power-rune', 'wisdom-rune', 'lotus-rune',
      'night', 'day', 'neutral-camp', 'tormentor', 'aghanim-shard',
      'siege-creep', 'flagbearer-creep',
    ];
    for (const id of expectedIds) {
      expect(defaults[id]).toBeDefined();
      expect(defaults[id].type).toBe('bundled');
    }
    expect(Object.keys(defaults)).toHaveLength(expectedIds.length);
  });
});
