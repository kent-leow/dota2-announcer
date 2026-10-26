export interface Point {
  x: number;
  y: number;
}

export interface PositionSample extends Point {
  t: number;
  distanceToPlayer: number | null;
}

export interface SpeedSample {
  t: number;
  speed: number;
}

export type TrackState = 'visible' | 'fog' | 'dead';

export interface EnemyTrack {
  name: string;
  state: TrackState;
  lastSeen: PositionSample | null;
  samples: PositionSample[];
  speedSamples: SpeedSample[];
  validSampleCount: number;
  learnedSpeed: number | null;
  vanishedAt: number | null;
  headingAway: boolean;
}

export type WarningSource = 'visible' | 'fog';

export interface EtaResult {
  eta: number | null;
  source: WarningSource;
  expired: boolean;
}

export interface EngineSettings {
  leadSeconds: number;
  engageDistance: number;
  maxFogSeconds: number;
  visibleEnabled: boolean;
  fogEnabled: boolean;
}

export interface WarningHero {
  name: string;
  etaSeconds: number;
  source: WarningSource;
}

export interface MapAwarenessWarning {
  heroes: WarningHero[];
  etaSeconds: number;
  clockTime: number;
  grouped: boolean;
}

export interface TrackTransitions {
  vanished: string[];
  reappeared: string[];
}
