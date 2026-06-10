import { EventsConfig } from 'src/config/events.schema';

export interface GsiInstallResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface ElectronAPI {
  getState: () => Promise<string>;
  getElapsed: () => Promise<number>;
  onStateChange: (callback: (state: string) => void) => () => void;
  onClockTick: (callback: (elapsedMs: number) => void) => () => void;
  toggleMute: () => Promise<boolean>;
  setMuted: (muted: boolean) => Promise<void>;
  isMuted: () => Promise<boolean>;
  setVolume: (value: number) => Promise<void>;
  getVolume: () => Promise<number>;
  getEvents: () => Promise<EventsConfig>;
  reloadEvents: () => Promise<EventsConfig>;
  gsiInstall: () => Promise<GsiInstallResult>;
  gsiGetInstallPath: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
