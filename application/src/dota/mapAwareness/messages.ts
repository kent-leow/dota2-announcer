import { MapAwarenessWarning } from './types';
import { displayName } from './heroNames';

function roundEta(eta: number): number {
  return Math.round(eta);
}

function secondsPhrase(eta: number): string {
  const seconds = roundEta(eta);
  if (seconds <= 0) return 'now';
  return seconds === 1 ? '1 second' : `${seconds} seconds`;
}

export function speechText(warning: MapAwarenessWarning): string {
  const subject = warning.grouped ? `${warning.heroes.length} heroes` : displayName(warning.heroes[0].name);
  return `${subject}, ${secondsPhrase(warning.etaSeconds)}`;
}

export function overlayTitle(warning: MapAwarenessWarning): string {
  if (warning.grouped) {
    return `${warning.heroes.length} heroes: ${warning.heroes.map((h) => displayName(h.name)).join(', ')}`;
  }
  const hero = warning.heroes[0];
  const name = displayName(hero.name);
  return hero.source === 'fog' ? `${name} (fog)` : name;
}

export function overlayOffsetSeconds(warning: MapAwarenessWarning): number {
  return Math.max(0, roundEta(warning.etaSeconds));
}
