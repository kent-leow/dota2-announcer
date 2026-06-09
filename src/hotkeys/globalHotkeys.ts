import { globalShortcut, app } from 'electron';
import * as muteManager from 'src/tts/muteManager';
import { reload } from 'src/config/eventsLoader';
import { loadSchedule } from 'src/scheduler/eventScheduler';

const DEBOUNCE_MS = 200;

let lastMuteTime = 0;
let lastReloadTime = 0;
let registered = false;

export type HotkeyAction = 'mute-toggle' | 'reload-config';
export type HotkeyCallback = (action: HotkeyAction) => void;

let actionCallback: HotkeyCallback | null = null;

export function onHotkeyAction(cb: HotkeyCallback): void {
  actionCallback = cb;
}

function handleMuteToggle(): void {
  const now = Date.now();
  if (now - lastMuteTime < DEBOUNCE_MS) return;
  lastMuteTime = now;
  muteManager.toggleMute();
  actionCallback?.('mute-toggle');
}

function handleReloadConfig(): void {
  const now = Date.now();
  if (now - lastReloadTime < DEBOUNCE_MS) return;
  lastReloadTime = now;
  reload();
  loadSchedule();
  actionCallback?.('reload-config');
}

export function registerHotkeys(): void {
  if (registered) return;

  globalShortcut.register('Ctrl+Shift+M', handleMuteToggle);
  globalShortcut.register('Ctrl+Shift+R', handleReloadConfig);

  registered = true;

  app.on('will-quit', unregisterHotkeys);
}

export function unregisterHotkeys(): void {
  if (!registered) return;
  globalShortcut.unregisterAll();
  registered = false;
}

export function isRegistered(): boolean {
  return registered;
}

export function _resetForTesting(): void {
  lastMuteTime = 0;
  lastReloadTime = 0;
  registered = false;
  actionCallback = null;
}
