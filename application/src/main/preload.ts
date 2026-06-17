import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onMenuOpenGuide: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:openGuide', handler);
    return () => { ipcRenderer.removeListener('menu:openGuide', handler); };
  },
  getState: () => ipcRenderer.invoke('dota:getState'),
  getElapsed: () => ipcRenderer.invoke('dota:getElapsed'),
  isPaused: () => ipcRenderer.invoke('dota:isPaused'),
  getGsiStatus: () => ipcRenderer.invoke('dota:getGsiStatus'),
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
  onGsiStatusUpdate: (callback: (status: { daytime: boolean; roshanState: string; roshanStateEndSeconds: number; minRespawnSeconds: number; maxRespawnSeconds: number; clockTime: number }) => void) => {
    const handler = (_event: unknown, status: { daytime: boolean; roshanState: string; roshanStateEndSeconds: number; minRespawnSeconds: number; maxRespawnSeconds: number; clockTime: number }) => callback(status);
    ipcRenderer.on('dota:gsiStatusUpdate', handler);
    return () => { ipcRenderer.removeListener('dota:gsiStatusUpdate', handler); };
  },
  onRoshanEvent: (callback: (eventType: string) => void) => {
    const handler = (_event: unknown, eventType: string) => callback(eventType);
    ipcRenderer.on('dota:roshanEvent', handler);
    return () => { ipcRenderer.removeListener('dota:roshanEvent', handler); };
  },
  sendOverlayNotification: (payload: { eventName: string; offsetSeconds: number; eventId: string; happenTimeMs: number }) => ipcRenderer.send('overlay:announcement', payload),
  sendOverlayUpcoming: (occurrences: Array<{ eventId: string; eventName: string; happenTimeMs: number }>) => ipcRenderer.send('overlay:sendUpcoming', occurrences),
  onEventsChanged: (callback: (config: unknown) => void) => {
    const handler = (_event: unknown, config: unknown) => callback(config);
    ipcRenderer.on('config:eventsChanged', handler);
    return () => { ipcRenderer.removeListener('config:eventsChanged', handler); };
  },
  getNotificationConfig: () => ipcRenderer.invoke('overlay:notification:getConfig'),
  setNotificationConfig: (config: unknown) => ipcRenderer.invoke('overlay:notification:setConfig', config),
  getPersistentConfig: () => ipcRenderer.invoke('overlay:persistent:getConfig'),
  setPersistentConfig: (config: unknown) => ipcRenderer.invoke('overlay:persistent:setConfig', config),
  getOverlaySize: () => ipcRenderer.invoke('overlay:getSize'),
  setOverlaySize: (size: number) => ipcRenderer.invoke('overlay:setSize', size),
  onOverlayConfigChanged: (callback: (config: unknown) => void) => {
    const handler = (_event: unknown, config: unknown) => callback(config);
    ipcRenderer.on('overlay:configChanged', handler);
    return () => { ipcRenderer.removeListener('overlay:configChanged', handler); };
  },
  getDynamicEvents: () => ipcRenderer.invoke('config:getDynamicEvents'),
  setDynamicEvents: (config: unknown) => ipcRenderer.invoke('config:setDynamicEvents', config),
});
