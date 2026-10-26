import { speechText, overlayTitle, overlayOffsetSeconds } from './messages';
import { MapAwarenessWarning, WarningHero } from './types';

function warning(heroes: WarningHero[], etaSeconds: number): MapAwarenessWarning {
  return { heroes, etaSeconds, clockTime: 100, grouped: heroes.length > 1 };
}

const tide = (eta: number, source: 'visible' | 'fog' = 'visible'): WarningHero => ({ name: 'tidehunter', etaSeconds: eta, source });

describe('messages', () => {
  it('rounds the ETA to whole seconds', () => {
    expect(speechText(warning([tide(4.4)], 4.4))).toBe('Tidehunter, 4 seconds');
    expect(speechText(warning([tide(4.5)], 4.5))).toBe('Tidehunter, 5 seconds');
  });

  it('says "now" for zero', () => {
    expect(speechText(warning([tide(0)], 0))).toBe('Tidehunter, now');
  });

  it('uses the singular for one second', () => {
    expect(speechText(warning([tide(1)], 1))).toBe('Tidehunter, 1 second');
  });

  it('announces grouped warnings by count', () => {
    const w = warning([tide(3), { name: 'nevermore', etaSeconds: 4, source: 'fog' }, { name: 'lion', etaSeconds: 5, source: 'visible' }], 3);
    expect(speechText(w)).toBe('3 heroes, 3 seconds');
    expect(overlayTitle(w)).toBe('3 heroes: Tidehunter, Shadow Fiend, Lion');
  });

  it('tags fog warnings in the overlay title only', () => {
    expect(overlayTitle(warning([tide(3, 'fog')], 3))).toBe('Tidehunter (fog)');
    expect(overlayTitle(warning([tide(3)], 3))).toBe('Tidehunter');
  });

  it('never returns a negative overlay offset', () => {
    expect(overlayOffsetSeconds(warning([tide(0)], 0))).toBe(0);
    expect(overlayOffsetSeconds(warning([tide(4.6)], 4.6))).toBe(5);
  });
});
