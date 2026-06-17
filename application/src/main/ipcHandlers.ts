import { ipcMain, BrowserWindow, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as gsiServer from 'src/dota/gsiServer';
import * as matchStateManager from 'src/dota/matchStateManager';
import * as roshanTracker from 'src/dota/roshanTracker';
import * as gameTimer from 'src/timer/gameTimer';
import * as muteManager from 'src/tts/muteManager';
import * as volumeController from 'src/tts/volumeController';
import * as eventsLoader from 'src/config/eventsLoader';
import { eventsConfigSchema, dynamicEventsConfigSchema } from 'src/config/events.schema';
import { readAppState, writeAppState, NotificationOverlayConfig, PersistentOverlayConfig } from 'src/tts/stateStore';
import { getOverlayWindow } from './overlayWindow';

function findDotaGsiPath(): string | null {
  const platform = process.platform;
  const candidates: string[] = [];

  if (platform === 'win32') {
    candidates.push(
      'C:\\Program Files (x86)\\Steam\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg\\gamestate_integration',
      'D:\\Steam\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg\\gamestate_integration',
      'D:\\SteamLibrary\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg\\gamestate_integration',
    );
  } else if (platform === 'darwin') {
    const home = app.getPath('home');
    candidates.push(
      path.join(home, 'Library/Application Support/Steam/steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration'),
    );
  } else {
    const home = app.getPath('home');
    candidates.push(
      path.join(home, '.steam/steam/steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration'),
      path.join(home, '.local/share/Steam/steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration'),
    );
  }

  for (const candidate of candidates) {
    const cfgDir = path.dirname(candidate);
    if (fs.existsSync(cfgDir)) {
      return candidate;
    }
  }
  return null;
}

export function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
  gsiServer.start();
  matchStateManager.startListening();

  matchStateManager.onPhaseChange((phase) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:stateChanged', phase);
    }
  });

  gsiServer.onStateChange((state) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      const roshanTimer = roshanTracker.getRoshanTimerState();
      const effectiveRoshanState = roshanTimer.state !== 'alive' ? roshanTimer.state : state.roshanState;
      const minRespawnSeconds = roshanTimer.minRespawnGameTime > 0
        ? Math.max(0, roshanTimer.minRespawnGameTime - state.clockTime) : 0;
      const maxRespawnSeconds = roshanTimer.maxRespawnGameTime > 0
        ? Math.max(0, roshanTimer.maxRespawnGameTime - state.clockTime) : 0;
      win.webContents.send('dota:gsiStatusUpdate', {
        daytime: state.daytime,
        roshanState: effectiveRoshanState,
        roshanStateEndSeconds: maxRespawnSeconds,
        minRespawnSeconds,
        maxRespawnSeconds,
        clockTime: state.clockTime,
      });
    }
  });

  roshanTracker.onRoshanEvent((event) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:roshanEvent', event.type);
    }
  });


  matchStateManager.onPauseChange((isPaused) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:pauseChanged', isPaused);
    }
  });

  gameTimer.onTick((elapsedMs) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:clockTick', elapsedMs);
    }
    const overlay = getOverlayWindow();
    if (overlay && !overlay.isDestroyed()) {
      overlay.webContents.send('overlay:tick', elapsedMs);
    }
  });

  ipcMain.handle('dota:getState', () => matchStateManager.getPhase());
  ipcMain.handle('dota:getElapsed', () => gameTimer.getElapsedMillis());
  ipcMain.handle('dota:isPaused', () => matchStateManager.isPaused());
  ipcMain.handle('audio:toggleMute', () => muteManager.toggleMute());
  ipcMain.handle('audio:setMuted', (_event, muted: boolean) => muteManager.setMuted(muted));
  ipcMain.handle('audio:isMuted', () => muteManager.isMuted());
  ipcMain.handle('audio:setVolume', (_event, value: number) => volumeController.setVolume(value));
  ipcMain.handle('audio:getVolume', () => volumeController.getVolume());
  ipcMain.handle('config:getEvents', () => eventsLoader.getEvents());
  ipcMain.handle('config:reloadEvents', () => {
    const config = eventsLoader.reload();
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('config:eventsChanged', config);
    }
    return config;
  });
  ipcMain.handle('config:saveEvents', (_event, config: { events: unknown[] }) => {
    const parsed = eventsConfigSchema.safeParse(config);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }
    eventsLoader.saveEvents(parsed.data);
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('config:eventsChanged', parsed.data);
    }
    return { success: true, config: parsed.data };
  });

  ipcMain.handle('audio:getIncludeTimeSuffix', () => readAppState().includeTimeSuffix);
  ipcMain.handle('audio:setIncludeTimeSuffix', (_event, value: boolean) => {
    const state = readAppState();
    state.includeTimeSuffix = value;
    writeAppState(state);
    return value;
  });

  ipcMain.handle('audio:getRate', () => readAppState().rate);
  ipcMain.handle('audio:setRate', (_event, value: number) => {
    const state = readAppState();
    state.rate = Math.max(0.5, Math.min(3.0, value));
    writeAppState(state);
    return state.rate;
  });

  ipcMain.handle('audio:getVoiceUri', () => readAppState().voiceUri);
  ipcMain.handle('audio:setVoiceUri', (_event, uri: string) => {
    const state = readAppState();
    state.voiceUri = uri;
    writeAppState(state);
    return uri;
  });

  ipcMain.handle('gsi:getInstallPath', () => findDotaGsiPath());
  ipcMain.handle('gsi:install', () => {
    const targetDir = findDotaGsiPath();
    if (!targetDir) {
      return { success: false, error: 'Could not find Dota 2 installation. Please install manually.' };
    }
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const srcFile = path.join(app.getAppPath(), 'config', 'gamestate_integration_announcer.cfg');
      const destFile = path.join(targetDir, 'gamestate_integration_announcer.cfg');
      fs.copyFileSync(srcFile, destFile);
      return { success: true, path: destFile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('gsi:uninstall', () => {
    const targetDir = findDotaGsiPath();
    if (!targetDir) {
      return { success: false, error: 'Could not find Dota 2 installation.' };
    }
    const cfgFile = path.join(targetDir, 'gamestate_integration_announcer.cfg');
    try {
      if (fs.existsSync(cfgFile)) {
        fs.unlinkSync(cfgFile);
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('gsi:isInstalled', () => {
    const targetDir = findDotaGsiPath();
    if (!targetDir) return false;
    return fs.existsSync(path.join(targetDir, 'gamestate_integration_announcer.cfg'));
  });

  ipcMain.handle('gsi:isConnected', () => {
    const last = gsiServer.getLastState();
    return last !== null;
  });

  ipcMain.handle('config:getDynamicEvents', () => {
    const state = readAppState();
    return { dynamicEvents: state.dynamicEvents };
  });

  ipcMain.handle('config:setDynamicEvents', (_event, config: { dynamicEvents: unknown[] }) => {
    const parsed = dynamicEventsConfigSchema.safeParse(config);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }
    const state = readAppState();
    state.dynamicEvents = parsed.data.dynamicEvents;
    writeAppState(state);
    return { success: true };
  });


  ipcMain.on('overlay:announcement', (_event, payload: { eventName: string; offsetSeconds: number; eventId: string; happenTimeMs?: number; icon?: string }) => {
    const overlay = getOverlayWindow();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:notify', {
      ...payload,
      timestamp: Date.now(),
    });
  });

  ipcMain.on('overlay:sendUpcoming', (_event, occurrences: Array<{ eventId: string; eventName: string; happenTimeMs: number; icon?: string }>) => {
    const overlay = getOverlayWindow();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:upcoming', occurrences);
  });

  ipcMain.handle('overlay:notification:getConfig', () => readAppState().notification);
  ipcMain.handle('overlay:notification:setConfig', (_event, config: Partial<NotificationOverlayConfig>) => {
    const state = readAppState();
    if (typeof config.enabled === 'boolean') state.notification.enabled = config.enabled;
    if (config.position === 'left' || config.position === 'right') state.notification.position = config.position;
    if (config.fontSize) {
      state.notification.fontSize = {
        name: Math.max(10, Math.min(32, config.fontSize.name)),
        offset: Math.max(8, Math.min(28, config.fontSize.offset)),
      };
    }
    writeAppState(state);
    broadcastOverlayConfig(state, getWindow, getOverlayWindow);
    return state.notification;
  });

  ipcMain.handle('overlay:persistent:getConfig', () => readAppState().persistent);
  ipcMain.handle('overlay:persistent:setConfig', (_event, config: Partial<PersistentOverlayConfig>) => {
    const state = readAppState();
    if (typeof config.enabled === 'boolean') state.persistent.enabled = config.enabled;
    if (config.position === 'left' || config.position === 'right') state.persistent.position = config.position;
    if (config.fontSize) {
      state.persistent.fontSize = {
        name: Math.max(10, Math.min(32, config.fontSize.name)),
        offset: Math.max(8, Math.min(28, config.fontSize.offset)),
      };
    }
    if (typeof config.eventCount === 'number') {
      state.persistent.eventCount = Math.max(1, Math.min(10, config.eventCount));
    }
    if (typeof config.lookaheadSeconds === 'number') {
      state.persistent.lookaheadSeconds = Math.max(5, Math.min(300, config.lookaheadSeconds));
    }
    writeAppState(state);
    broadcastOverlayConfig(state, getWindow, getOverlayWindow);
    return state.persistent;
  });

  ipcMain.handle('overlay:getSize', () => readAppState().overlaySize);
  ipcMain.handle('overlay:setSize', (_event, size: number) => {
    const state = readAppState();
    state.overlaySize = Math.max(1, Math.min(10, size));
    writeAppState(state);
    broadcastOverlayConfig(state, getWindow, getOverlayWindow);
    return state.overlaySize;
  });
}

function broadcastOverlayConfig(
  state: ReturnType<typeof readAppState>,
  getWindow: () => BrowserWindow | null,
  getOverlay: typeof getOverlayWindow,
): void {
  const payload = {
    notification: state.notification,
    persistent: state.persistent,
    overlaySize: state.overlaySize,
  };
  const overlay = getOverlay();
  if (overlay && !overlay.isDestroyed()) {
    overlay.webContents.send('overlay:config', payload);
  }
  const win = getWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send('overlay:configChanged', payload);
  }
}
