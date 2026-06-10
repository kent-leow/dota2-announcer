import { EventsConfig } from 'src/config/events.schema';

export interface GsiInstallResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface ElectronAPI {
  getState: () => Promise<string>;
  getElapsed: () => Promise<number>;
  isPaused: () => Promise<boolean>;
  onStateChange: (callback: (state: string) => void) => () => void;
  onClockTick: (callback: (elapsedMs: number) => void) => () => void;
  onPauseChange: (callback: (paused: boolean) => void) => () => void;
  toggleMute: () => Promise<boolean>;
  setMuted: (muted: boolean) => Promise<void>;
  isMuted: () => Promise<boolean>;
  setVolume: (value: number) => Promise<void>;
  getVolume: () => Promise<number>;
  getEvents: () => Promise<EventsConfig>;
  reloadEvents: () => Promise<EventsConfig>;
  getIncludeTimeSuffix: () => Promise<boolean>;
  setIncludeTimeSuffix: (value: boolean) => Promise<boolean>;
  gsiInstall: () => Promise<GsiInstallResult>;
  gsiGetInstallPath: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
