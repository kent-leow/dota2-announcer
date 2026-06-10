import { ipcMain, BrowserWindow, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as gsiServer from 'src/dota/gsiServer';
import * as matchStateManager from 'src/dota/matchStateManager';
import * as gameTimer from 'src/timer/gameTimer';
import * as muteManager from 'src/tts/muteManager';
import * as volumeController from 'src/tts/volumeController';
import * as eventsLoader from 'src/config/eventsLoader';

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

  gameTimer.onTick((elapsedMs) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:clockTick', elapsedMs);
    }
  });

  ipcMain.handle('dota:getState', () => matchStateManager.getPhase());
  ipcMain.handle('dota:getElapsed', () => gameTimer.getElapsedMillis());
  ipcMain.handle('audio:toggleMute', () => muteManager.toggleMute());
  ipcMain.handle('audio:setMuted', (_event, muted: boolean) => muteManager.setMuted(muted));
  ipcMain.handle('audio:isMuted', () => muteManager.isMuted());
  ipcMain.handle('audio:setVolume', (_event, value: number) => volumeController.setVolume(value));
  ipcMain.handle('audio:getVolume', () => volumeController.getVolume());
  ipcMain.handle('config:getEvents', () => eventsLoader.getEvents());
  ipcMain.handle('config:reloadEvents', () => eventsLoader.reload());

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
}
