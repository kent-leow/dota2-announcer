import { EventsConfig } from 'src/config/events.schema';

export interface GsiStatusUpdate {
  daytime: boolean;
  roshanState: string;
  roshanStateEndSeconds: number;
  clockTime: number;
}

export interface GsiInstallResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface SoundAssignment {
  type: 'bundled' | 'custom';
  filename: string;
}

export type SoundAssignments = Record<string, SoundAssignment>;

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
  getRate: () => Promise<number>;
  setRate: (value: number) => Promise<number>;
  getVoiceUri: () => Promise<string>;
  setVoiceUri: (uri: string) => Promise<string>;
  getEvents: () => Promise<EventsConfig>;
  reloadEvents: () => Promise<EventsConfig>;
  saveEvents: (config: EventsConfig) => Promise<{ success: boolean; error?: string; config?: EventsConfig }>;
  getIncludeTimeSuffix: () => Promise<boolean>;
  setIncludeTimeSuffix: (value: boolean) => Promise<boolean>;
  gsiInstall: () => Promise<GsiInstallResult>;
  gsiUninstall: () => Promise<GsiInstallResult>;
  gsiIsInstalled: () => Promise<boolean>;
  gsiIsConnected: () => Promise<boolean>;
  gsiGetInstallPath: () => Promise<string | null>;
  onGsiStatusUpdate: (callback: (status: GsiStatusUpdate) => void) => () => void;
  getSoundAssignments: () => Promise<SoundAssignments>;
  assignSound: (eventId: string, filePath: string) => Promise<{ success: boolean; error?: string; filename?: string }>;
  removeSound: (eventId: string) => Promise<{ success: boolean }>;
  getSoundFilePath: (eventId: string) => Promise<string | null>;
  openSoundFileDialog: () => Promise<{ success: boolean; canceled?: boolean; filePath?: string }>;
  sendOverlayNotification: (payload: { eventName: string; offsetSeconds: number; eventId: string }) => void;
  getOverlayPosition: () => Promise<'top-left' | 'top-center' | 'top-right'>;
  setOverlayPosition: (position: 'top-left' | 'top-center' | 'top-right') => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
