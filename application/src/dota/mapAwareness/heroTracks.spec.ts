import { updateTracks, TrackMap, isMovingAway } from './heroTracks';
import { VisibleHero } from '../gsiTypes';

const PLAYER = { x: 0, y: 0 };

function hero(name: string, x: number, y = 0): VisibleHero {
  return { name, x, y };
}

describe('heroTracks', () => {
  let tracks: TrackMap;

  beforeEach(() => {
    tracks = new Map();
  });

  it('keeps identity by name regardless of input order', () => {
    updateTracks(tracks, [hero('tidehunter', 1000), hero('nevermore', 2000)], 1, PLAYER);
    updateTracks(tracks, [hero('nevermore', 2100), hero('tidehunter', 1100)], 2, PLAYER);
    expect(tracks.size).toBe(2);
    expect(tracks.get('tidehunter')!.lastSeen).toMatchObject({ x: 1100, t: 2 });
    expect(tracks.get('nevermore')!.lastSeen).toMatchObject({ x: 2100, t: 2 });
  });

  it('only tracks heroes it is given', () => {
    updateTracks(tracks, [hero('tidehunter', 1000)], 1, PLAYER);
    expect([...tracks.keys()]).toEqual(['tidehunter']);
  });

  it('marks a hero as fogged when it vanishes', () => {
    updateTracks(tracks, [hero('tidehunter', 1000)], 1, PLAYER);
    const t = updateTracks(tracks, [], 2, PLAYER);
    const tr = tracks.get('tidehunter')!;
    expect(t.vanished).toEqual(['tidehunter']);
    expect(tr.state).toBe('fog');
    expect(tr.vanishedAt).toBe(2);
    expect(tr.lastSeen).toMatchObject({ x: 1000, t: 1 });
  });

  it('marks a fogged hero visible again and clears history', () => {
    updateTracks(tracks, [hero('tidehunter', 1000)], 1, PLAYER);
    updateTracks(tracks, [hero('tidehunter', 1300)], 2, PLAYER);
    updateTracks(tracks, [], 3, PLAYER);
    const t = updateTracks(tracks, [hero('tidehunter', 5000)], 10, PLAYER);
    const tr = tracks.get('tidehunter')!;
    expect(t.reappeared).toEqual(['tidehunter']);
    expect(tr.state).toBe('visible');
    expect(tr.samples).toHaveLength(1);
    expect(tr.validSampleCount).toBe(1);
  });

  it('follows the entry closest to the last known position when names repeat', () => {
    updateTracks(tracks, [hero('tidehunter', 1000)], 1, PLAYER);
    updateTracks(tracks, [hero('tidehunter', 5000), hero('tidehunter', 1200)], 2, PLAYER);
    expect(tracks.get('tidehunter')!.lastSeen!.x).toBe(1200);
  });

  it('records distance to the player on each sample', () => {
    updateTracks(tracks, [hero('tidehunter', 3, 4)], 1, PLAYER);
    expect(tracks.get('tidehunter')!.samples[0].distanceToPlayer).toBe(5);
  });

  it('flags heading away when last movement points away from the player', () => {
    updateTracks(tracks, [hero('tidehunter', 1000)], 1, PLAYER);
    updateTracks(tracks, [hero('tidehunter', 1300)], 2, PLAYER);
    updateTracks(tracks, [], 3, PLAYER);
    expect(tracks.get('tidehunter')!.headingAway).toBe(true);
  });

  it('does not flag heading away when moving toward the player', () => {
    updateTracks(tracks, [hero('tidehunter', 1300)], 1, PLAYER);
    updateTracks(tracks, [hero('tidehunter', 1000)], 2, PLAYER);
    updateTracks(tracks, [], 3, PLAYER);
    expect(tracks.get('tidehunter')!.headingAway).toBe(false);
  });

  it('does not flag heading away with a single sample', () => {
    updateTracks(tracks, [hero('tidehunter', 1000)], 1, PLAYER);
    updateTracks(tracks, [], 2, PLAYER);
    expect(tracks.get('tidehunter')!.headingAway).toBe(false);
  });

  it('does not flag heading away when standing still', () => {
    updateTracks(tracks, [hero('tidehunter', 1000)], 1, PLAYER);
    updateTracks(tracks, [hero('tidehunter', 1010)], 2, PLAYER);
    expect(isMovingAway(tracks.get('tidehunter')!, PLAYER)).toBe(false);
  });

  it('learns speed while visible', () => {
    for (let t = 0; t <= 3; t++) updateTracks(tracks, [hero('tidehunter', 4000 - t * 300)], t, PLAYER);
    expect(tracks.get('tidehunter')!.learnedSpeed).toBe(300);
  });
});
