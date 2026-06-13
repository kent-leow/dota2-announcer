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
  saveEvents: (config: unknown) => ipcRenderer.invoke('config:saveEvents', config),
  getIncludeTimeSuffix: () => ipcRenderer.invoke('audio:getIncludeTimeSuffix'),
  setIncludeTimeSuffix: (value: boolean) => ipcRenderer.invoke('audio:setIncludeTimeSuffix', value),
  getRate: () => ipcRenderer.invoke('audio:getRate'),
  setRate: (value: number) => ipcRenderer.invoke('audio:setRate', value),
  getVoiceUri: () => ipcRenderer.invoke('audio:getVoiceUri'),
  setVoiceUri: (uri: string) => ipcRenderer.invoke('audio:setVoiceUri', uri),
  gsiInstall: () => ipcRenderer.invoke('gsi:install'),
  gsiUninstall: () => ipcRenderer.invoke('gsi:uninstall'),
  gsiIsInstalled: () => ipcRenderer.invoke('gsi:isInstalled'),
  gsiIsConnected: () => ipcRenderer.invoke('gsi:isConnected'),
  gsiGetInstallPath: () => ipcRenderer.invoke('gsi:getInstallPath'),
  onGsiStatusUpdate: (callback: (status: { daytime: boolean; roshanState: string; roshanStateEndSeconds: number; clockTime: number }) => void) => {
    const handler = (_event: unknown, status: { daytime: boolean; roshanState: string; roshanStateEndSeconds: number; clockTime: number }) => callback(status);
    ipcRenderer.on('dota:gsiStatusUpdate', handler);
    return () => { ipcRenderer.removeListener('dota:gsiStatusUpdate', handler); };
  },
  getSoundAssignments: () => ipcRenderer.invoke('sound:getAssignments'),
  assignSound: (eventId: string, filePath: string) => ipcRenderer.invoke('sound:assign', eventId, filePath),
  removeSound: (eventId: string) => ipcRenderer.invoke('sound:remove', eventId),
  getSoundFilePath: (eventId: string) => ipcRenderer.invoke('sound:getFilePath', eventId),
  openSoundFileDialog: () => ipcRenderer.invoke('sound:openFileDialog'),
  sendOverlayNotification: (payload: { eventName: string; offsetSeconds: number; eventId: string }) => ipcRenderer.send('overlay:announcement', payload),
  getOverlayPosition: () => ipcRenderer.invoke('overlay:getPosition'),
  setOverlayPosition: (position: string) => ipcRenderer.invoke('overlay:setPosition', position),
  onEventsChanged: (callback: (config: unknown) => void) => {
    const handler = (_event: unknown, config: unknown) => callback(config);
    ipcRenderer.on('config:eventsChanged', handler);
    return () => { ipcRenderer.removeListener('config:eventsChanged', handler); };
  },
  getSoundDisabled: () => ipcRenderer.invoke('sound:getDisabled'),
  setSoundDisabled: (eventId: string, disabled: boolean) => ipcRenderer.invoke('sound:setDisabled', eventId, disabled),
});
