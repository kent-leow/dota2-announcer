import { EngineSettings, EtaResult, MapAwarenessWarning, WarningHero } from './types';
import { REARM_MARGIN_SECONDS, GROUP_WINDOW_SECONDS } from './constants';

interface Episode {
  fired: boolean;
  firedAt: number | null;
}

export interface PolicyInput {
  etas: Map<string, EtaResult>;
  rearm: Set<string>;
  playerAlive: boolean;
  now: number;
  settings: EngineSettings;
}

export interface WarningPolicy {
  evaluate(input: PolicyInput): MapAwarenessWarning[];
  reset(): void;
}

function isSourceEnabled(result: EtaResult, settings: EngineSettings): boolean {
  return result.source === 'visible' ? settings.visibleEnabled : settings.fogEnabled;
}

function shouldRearm(result: EtaResult | undefined, settings: EngineSettings): boolean {
  if (!result) return true;
  if (result.expired) return true;
  if (result.source !== 'visible') return false;
  return result.eta === null || result.eta > settings.leadSeconds + REARM_MARGIN_SECONDS;
}

export function createWarningPolicy(): WarningPolicy {
  const episodes = new Map<string, Episode>();

  function episodeOf(name: string): Episode {
    let episode = episodes.get(name);
    if (!episode) {
      episode = { fired: false, firedAt: null };
      episodes.set(name, episode);
    }
    return episode;
  }

  function toHero(name: string, result: EtaResult): WarningHero {
    return { name, etaSeconds: result.eta ?? 0, source: result.source };
  }

  return {
    evaluate({ etas, rearm, playerAlive, now, settings }) {
      for (const [name, episode] of episodes) {
        if (!episode.fired) continue;
        if (rearm.has(name) || shouldRearm(etas.get(name), settings)) {
          episode.fired = false;
          episode.firedAt = null;
        }
      }

      if (!playerAlive) return [];

      const crossing: string[] = [];
      for (const [name, result] of etas) {
        if (result.eta === null || result.eta > settings.leadSeconds) continue;
        if (!isSourceEnabled(result, settings)) continue;
        if (episodeOf(name).fired) continue;
        crossing.push(name);
      }
      if (crossing.length === 0) return [];

      const recentlyFired = [...episodes.entries()]
        .filter(([name, e]) => e.fired && e.firedAt !== null && e.firedAt >= now - GROUP_WINDOW_SECONDS && etas.get(name)?.eta != null)
        .map(([name]) => name);

      for (const name of crossing) {
        const episode = episodeOf(name);
        episode.fired = true;
        episode.firedAt = now;
      }

      const names = [...crossing, ...recentlyFired];
      const heroes = names
        .map((name) => toHero(name, etas.get(name)!))
        .sort((a, b) => a.etaSeconds - b.etaSeconds);
      return [{
        heroes,
        etaSeconds: heroes[0].etaSeconds,
        clockTime: now,
        grouped: heroes.length > 1,
      }];
    },
    reset() {
      episodes.clear();
    },
  };
}
