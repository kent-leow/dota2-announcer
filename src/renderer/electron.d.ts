import { EventsConfig } from 'src/config/events.schema';

export interface ElectronAPI {
  getState: () => Promise<string>;
  onStateChange: (callback: (state: string) => void) => () => void;
  toggleMute: () => Promise<boolean>;
  setMuted: (muted: boolean) => Promise<void>;
  isMuted: () => Promise<boolean>;
  setVolume: (value: number) => Promise<void>;
  getVolume: () => Promise<number>;
  getEvents: () => Promise<EventsConfig>;
  reloadEvents: () => Promise<EventsConfig>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
