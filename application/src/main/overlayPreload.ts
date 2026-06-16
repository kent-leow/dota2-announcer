import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayAPI', {
  onNotification: (callback: (payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number; happenTimeMs?: number }) => void) => {
    const handler = (_event: unknown, payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number; happenTimeMs?: number }) => callback(payload);
    ipcRenderer.on('overlay:notify', handler);
    return () => { ipcRenderer.removeListener('overlay:notify', handler); };
  },
  getNotificationConfig: () => ipcRenderer.invoke('overlay:notification:getConfig'),
  getPersistentConfig: () => ipcRenderer.invoke('overlay:persistent:getConfig'),
  getOverlaySize: () => ipcRenderer.invoke('overlay:getSize'),
  onConfigChange: (callback: (config: { notification: unknown; persistent: unknown }) => void) => {
    const handler = (_event: unknown, config: { notification: unknown; persistent: unknown }) => callback(config);
    ipcRenderer.on('overlay:config', handler);
    return () => { ipcRenderer.removeListener('overlay:config', handler); };
  },
  onTick: (callback: (elapsedMs: number) => void) => {
    const handler = (_event: unknown, elapsedMs: number) => callback(elapsedMs);
    ipcRenderer.on('overlay:tick', handler);
    return () => { ipcRenderer.removeListener('overlay:tick', handler); };
  },
  onUpcoming: (callback: (occurrences: Array<{ eventId: string; eventName: string; happenTimeMs: number }>) => void) => {
    const handler = (_event: unknown, occurrences: Array<{ eventId: string; eventName: string; happenTimeMs: number }>) => callback(occurrences);
    ipcRenderer.on('overlay:upcoming', handler);
    return () => { ipcRenderer.removeListener('overlay:upcoming', handler); };
  },
});
