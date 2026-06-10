export type TrackedEventType = 'roshan' | 'buyback' | 'glyph';

export interface Deadline {
  label: string;
  timeMs: number;
}

export interface TrackedEvent {
  type: TrackedEventType;
  loggedAtMs: number;
  deadlines: Deadline[];
}

export type GameStatusState = Record<TrackedEventType, TrackedEvent | null>;
