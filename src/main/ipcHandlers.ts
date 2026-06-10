import { ipcMain, BrowserWindow } from 'electron';
import * as gsiServer from 'src/dota/gsiServer';
import * as matchStateManager from 'src/dota/matchStateManager';
import * as muteManager from 'src/tts/muteManager';
import * as volumeController from 'src/tts/volumeController';
import * as eventsLoader from 'src/config/eventsLoader';

export function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
  gsiServer.start();
  matchStateManager.startListening();

  matchStateManager.onPhaseChange((phase) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('dota:stateChanged', phase);
    }
  });

  ipcMain.handle('dota:getState', () => matchStateManager.getPhase());
  ipcMain.handle('audio:toggleMute', () => muteManager.toggleMute());
  ipcMain.handle('audio:setMuted', (_event, muted: boolean) => muteManager.setMuted(muted));
  ipcMain.handle('audio:isMuted', () => muteManager.isMuted());
  ipcMain.handle('audio:setVolume', (_event, value: number) => volumeController.setVolume(value));
  ipcMain.handle('audio:getVolume', () => volumeController.getVolume());
  ipcMain.handle('config:getEvents', () => eventsLoader.getEvents());
  ipcMain.handle('config:reloadEvents', () => eventsLoader.reload());
}
