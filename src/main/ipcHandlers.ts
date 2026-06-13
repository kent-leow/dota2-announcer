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

  gameTimer.onTick((elapsedMs) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:clockTick', elapsedMs);
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
  ipcMain.handle('config:reloadEvents', () => eventsLoader.reload());
  ipcMain.handle('config:saveEvents', (_event, config: { events: unknown[] }) => {
    const { eventsConfigSchema } = require('src/config/events.schema');
    const parsed = eventsConfigSchema.safeParse(config);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }
    eventsLoader.saveEvents(parsed.data);
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

  ipcMain.on('overlay:announcement', (_event, payload: { eventName: string; offsetSeconds: number; eventId: string }) => {
    const overlay = getOverlayWindow();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:notify', {
      ...payload,
      timestamp: Date.now(),
    });
  });
}
