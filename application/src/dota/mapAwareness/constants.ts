export const MAP_AWARENESS_EVENT_ID = 'map-awareness';

export const MAX_MOVE_SPEED = 550;
export const BLINK_REJECT_FACTOR = 1.2;
export const IDLE_SPEED_FLOOR = 50;
export const SPEED_WINDOW_SECONDS = 3;
export const MIN_SPEED_SAMPLES = 3;
export const FALLBACK_SPEED = 350;
// Observed speed underestimates a hero that is last-hitting or juking; never assume a fogged hero is slower than this.
export const MIN_FOG_SPEED = FALLBACK_SPEED;

export const DEATH_MATCH_WINDOW_SECONDS = 2;

export const VISIBLE_ETA_WINDOW_SECONDS = 3;
export const MIN_CLOSING_RATE = 100;
export const FOG_GRACE_SECONDS = 1;
export const TURN_AROUND_SECONDS = 1;

export const REARM_MARGIN_SECONDS = 3;
export const GROUP_WINDOW_SECONDS = 3;

export const SAMPLE_HISTORY_SECONDS = 4;

export const LEAD_SECONDS = { default: 5, min: 2, max: 15 } as const;
export const ENGAGE_DISTANCE = { default: 800, min: 300, max: 1500 } as const;
export const MAX_FOG_SECONDS = { default: 20, min: 5, max: 40 } as const;
