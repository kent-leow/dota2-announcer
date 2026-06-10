import { ipcMain, BrowserWindow } from 'electron';
import * as processDetector from 'src/dota/processDetector';
import * as muteManager from 'src/tts/muteManager';
import * as volumeController from 'src/tts/volumeController';
import * as eventsLoader from 'src/config/eventsLoader';

export function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
  processDetector.startDetection();
  processDetector.onStateChange((state) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:stateChanged', state);
    }
  });

  ipcMain.handle('dota:getState', () => processDetector.getState());
  ipcMain.handle('audio:toggleMute', () => muteManager.toggleMute());
  ipcMain.handle('audio:setMuted', (_event, muted: boolean) => muteManager.setMuted(muted));
  ipcMain.handle('audio:isMuted', () => muteManager.isMuted());
  ipcMain.handle('audio:setVolume', (_event, value: number) => volumeController.setVolume(value));
  ipcMain.handle('audio:getVolume', () => volumeController.getVolume());
  ipcMain.handle('config:getEvents', () => eventsLoader.getEvents());
  ipcMain.handle('config:reloadEvents', () => eventsLoader.reload());
}
