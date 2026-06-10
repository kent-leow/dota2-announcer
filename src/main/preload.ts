import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getState: () => ipcRenderer.invoke('dota:getState'),
  getElapsed: () => ipcRenderer.invoke('dota:getElapsed'),
  isPaused: () => ipcRenderer.invoke('dota:isPaused'),
  onStateChange: (callback: (state: string) => void) => {
    const handler = (_event: unknown, state: string) => callback(state);
    ipcRenderer.on('dota:stateChanged', handler);
    return () => { ipcRenderer.removeListener('dota:stateChanged', handler); };
  },
  onClockTick: (callback: (elapsedMs: number) => void) => {
    const handler = (_event: unknown, elapsedMs: number) => callback(elapsedMs);
    ipcRenderer.on('dota:clockTick', handler);
    return () => { ipcRenderer.removeListener('dota:clockTick', handler); };
  },
  onPauseChange: (callback: (paused: boolean) => void) => {
    const handler = (_event: unknown, paused: boolean) => callback(paused);
    ipcRenderer.on('dota:pauseChanged', handler);
    return () => { ipcRenderer.removeListener('dota:pauseChanged', handler); };
  },
  toggleMute: () => ipcRenderer.invoke('audio:toggleMute'),
  setMuted: (muted: boolean) => ipcRenderer.invoke('audio:setMuted', muted),
  isMuted: () => ipcRenderer.invoke('audio:isMuted'),
  setVolume: (value: number) => ipcRenderer.invoke('audio:setVolume', value),
  getVolume: () => ipcRenderer.invoke('audio:getVolume'),
  getEvents: () => ipcRenderer.invoke('config:getEvents'),
  reloadEvents: () => ipcRenderer.invoke('config:reloadEvents'),
  getIncludeTimeSuffix: () => ipcRenderer.invoke('audio:getIncludeTimeSuffix'),
  setIncludeTimeSuffix: (value: boolean) => ipcRenderer.invoke('audio:setIncludeTimeSuffix', value),
  gsiInstall: () => ipcRenderer.invoke('gsi:install'),
  gsiGetInstallPath: () => ipcRenderer.invoke('gsi:getInstallPath'),
});
