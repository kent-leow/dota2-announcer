import { createDeathInference } from './deathInference';
import { updateTracks, TrackMap } from './heroTracks';
import { VisibleHero } from '../gsiTypes';

const PLAYER = { x: 0, y: 0 };
const h = (name: string): VisibleHero => ({ name, x: 1000, y: 0 });

describe('deathInference', () => {
  let tracks: TrackMap;
  let deaths: ReturnType<typeof createDeathInference>;

  function tick(t: number, visible: string[], radiant: number, dire = 0, team: 'radiant' | 'dire' = 'radiant'): string[] {
    const tr = updateTracks(tracks, visible.map(h), t, PLAYER);
    return deaths.update(tracks, tr.vanished, tr.reappeared, { radiant, dire }, team, t);
  }

  beforeEach(() => {
    tracks = new Map();
    deaths = createDeathInference();
  });

  it('marks a hero dead when score rises in the same second it vanishes', () => {
    tick(1, ['tidehunter', 'nevermore'], 0);
    expect(tick(2, ['nevermore'], 1)).toEqual(['tidehunter']);
    expect(tracks.get('tidehunter')!.state).toBe('dead');
  });

  it('marks a hero dead when score rises one second after it vanishes', () => {
    tick(1, ['tidehunter'], 0);
    tick(2, [], 0);
    expect(tick(3, [], 1)).toEqual(['tidehunter']);
  });

  it('does not match a score rise three seconds later', () => {
    tick(1, ['tidehunter'], 0);
    tick(2, [], 0);
    tick(3, [], 0);
    tick(4, [], 0);
    expect(tick(5, [], 1)).toEqual([]);
    expect(tracks.get('tidehunter')!.state).toBe('fog');
  });

  it('marks two heroes dead for a double kill', () => {
    tick(1, ['tidehunter', 'nevermore'], 0);
    expect(tick(2, [], 2).sort()).toEqual(['nevermore', 'tidehunter']);
  });

  it('marks nobody dead when counts do not match', () => {
    tick(1, ['tidehunter', 'nevermore'], 0);
    expect(tick(2, [], 1)).toEqual([]);
    expect(tracks.get('tidehunter')!.state).toBe('fog');
    expect(tracks.get('nevermore')!.state).toBe('fog');
  });

  it('resolves a mismatch when one vanished hero reappears inside the window', () => {
    tick(1, ['tidehunter', 'nevermore'], 0);
    tick(2, [], 1);
    expect(tick(3, ['nevermore'], 1)).toEqual(['tidehunter']);
  });

  it('ignores a score rise with nobody vanished', () => {
    tick(1, ['tidehunter'], 0);
    expect(tick(2, ['tidehunter'], 1)).toEqual([]);
    tick(3, ['tidehunter'], 1);
    tick(4, ['tidehunter'], 1);
    expect(tick(5, [], 1)).toEqual([]);
  });

  it('lets a dead hero become visible again', () => {
    tick(1, ['tidehunter'], 0);
    tick(2, [], 1);
    tick(60, ['tidehunter'], 1);
    expect(tracks.get('tidehunter')!.state).toBe('visible');
  });

  it('uses the dire score for a dire player', () => {
    tick(1, ['tidehunter'], 0, 0, 'dire');
    expect(tick(2, [], 5, 0, 'dire')).toEqual([]);
    tick(3, ['tidehunter'], 5, 0, 'dire');
    expect(tick(4, [], 5, 1, 'dire')).toEqual(['tidehunter']);
  });

  it('ignores score decreases', () => {
    tick(1, ['tidehunter'], 5);
    expect(tick(2, [], 3)).toEqual([]);
  });
});
