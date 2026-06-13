import { ipcMain, BrowserWindow, app, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as gsiServer from 'src/dota/gsiServer';
import * as matchStateManager from 'src/dota/matchStateManager';
import * as gameTimer from 'src/timer/gameTimer';
import * as muteManager from 'src/tts/muteManager';
import * as volumeController from 'src/tts/volumeController';
import * as eventsLoader from 'src/config/eventsLoader';
import { readAppState, writeAppState } from 'src/tts/stateStore';
import * as soundStore from 'src/tts/soundStore';
import * as soundFileManager from 'src/tts/soundFileManager';
import { getOverlayWindow, setOverlayPosition, getOverlayPosition } from './overlayWindow';
import { OverlayPosition, OverlayFontSize, OverlayMode } from 'src/tts/stateStore';

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
      win.webContents.send('dota:gsiStatusUpdate', {
        daytime: state.daytime,
        roshanState: state.roshanState,
        roshanStateEndSeconds: state.roshanStateEndSeconds,
        clockTime: state.clockTime,
      });
    }
  });

  matchStateManager.onPauseChange((isPaused) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:pauseChanged', isPaused);
    }
  });

  let lastOverlayTickSec = -1;
  gameTimer.onTick((elapsedMs) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:clockTick', elapsedMs);
    }
    const currentSec = Math.floor(elapsedMs / 1000);
    if (currentSec !== lastOverlayTickSec) {
      lastOverlayTickSec = currentSec;
      const overlay = getOverlayWindow();
      if (overlay && !overlay.isDestroyed()) {
        overlay.webContents.send('overlay:tick', currentSec * 1000);
      }
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
    const { eventsConfigSchema } = require('src/config/events.schema');
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

  ipcMain.handle('sound:getDisabled', () => readAppState().soundDisabled);
  ipcMain.handle('sound:setDisabled', (_event, eventId: string, disabled: boolean) => {
    const state = readAppState();
    if (disabled) {
      state.soundDisabled[eventId] = true;
    } else {
      delete state.soundDisabled[eventId];
    }
    writeAppState(state);
  });

  ipcMain.handle('sound:getAssignments', () => {
    const defaults = soundStore.getDefaultSoundMap();
    const custom = soundStore.readSoundAssignments();
    return { ...defaults, ...custom };
  });

  ipcMain.handle('sound:assign', (_event, eventId: string, filePath: string) => {
    const validation = soundFileManager.validateAudioFile(filePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const filename = soundFileManager.copyToSoundsDir(filePath);
    soundStore.assignSound(eventId, { type: 'custom', filename });
    return { success: true, filename };
  });

  ipcMain.handle('sound:remove', (_event, eventId: string) => {
    const assignment = soundStore.getSoundForEvent(eventId);
    if (assignment && assignment.type === 'custom') {
      soundFileManager.deleteSoundFile(assignment.filename);
    }
    soundStore.removeSound(eventId);
    return { success: true };
  });

  ipcMain.handle('sound:getFilePath', (_event, eventId: string) => {
    const assignment = soundStore.getSoundForEvent(eventId);
    if (!assignment) return null;
    const filePath = assignment.type === 'custom'
      ? soundFileManager.getCustomSoundPath(assignment.filename)
      : soundFileManager.getBundledSoundPath(assignment.filename);
    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1);
      const mime = ext === 'mp3' ? 'audio/mpeg' : ext === 'ogg' ? 'audio/ogg' : 'audio/wav';
      return `data:${mime};base64,${data.toString('base64')}`;
    } catch {
      return null;
    }
  });

  ipcMain.handle('sound:openFileDialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }
    return { success: true, filePath: result.filePaths[0] };
  });

  ipcMain.on('overlay:announcement', (_event, payload: { eventName: string; offsetSeconds: number; eventId: string; happenTimeMs?: number }) => {
    const overlay = getOverlayWindow();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:notify', {
      ...payload,
      timestamp: Date.now(),
    });
  });

  ipcMain.on('overlay:sendUpcoming', (_event, occurrences: Array<{ eventId: string; eventName: string; happenTimeMs: number }>) => {
    const overlay = getOverlayWindow();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:upcoming', occurrences);
  });

  ipcMain.handle('overlay:getPosition', () => getOverlayPosition());
  ipcMain.handle('overlay:setPosition', (_event, position: OverlayPosition) => {
    setOverlayPosition(position);
    const overlay = getOverlayWindow();
    if (overlay && !overlay.isDestroyed()) {
      overlay.webContents.send('overlay:position', position);
    }
    return position;
  });

  ipcMain.handle('overlay:getFontSize', () => readAppState().overlayFontSize);
  ipcMain.handle('overlay:setFontSize', (_event, fontSize: OverlayFontSize) => {
    const state = readAppState();
    state.overlayFontSize = {
      name: Math.max(10, Math.min(32, fontSize.name)),
      offset: Math.max(8, Math.min(28, fontSize.offset)),
    };
    writeAppState(state);
    const overlay = getOverlayWindow();
    if (overlay && !overlay.isDestroyed()) {
      overlay.webContents.send('overlay:fontSize', state.overlayFontSize);
    }
    return state.overlayFontSize;
  });

  ipcMain.handle('overlay:getMode', () => readAppState().overlayMode);
  ipcMain.handle('overlay:setMode', (_event, mode: OverlayMode) => {
    const state = readAppState();
    state.overlayMode = mode;
    writeAppState(state);
    const overlay = getOverlayWindow();
    if (overlay && !overlay.isDestroyed()) {
      overlay.webContents.send('overlay:mode', mode);
    }
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('overlay:modeChanged', mode);
    }
    return mode;
  });

  ipcMain.handle('overlay:getEventCount', () => readAppState().overlayEventCount);
  ipcMain.handle('overlay:setEventCount', (_event, count: number) => {
    const state = readAppState();
    state.overlayEventCount = Math.max(1, Math.min(10, count));
    writeAppState(state);
    const overlay = getOverlayWindow();
    if (overlay && !overlay.isDestroyed()) {
      overlay.webContents.send('overlay:eventCount', state.overlayEventCount);
    }
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('overlay:eventCountChanged', state.overlayEventCount);
    }
    return state.overlayEventCount;
  });
}
