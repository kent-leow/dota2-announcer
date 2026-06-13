import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayAPI', {
  onNotification: (callback: (payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number; happenTimeMs?: number }) => void) => {
    const handler = (_event: unknown, payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number; happenTimeMs?: number }) => callback(payload);
    ipcRenderer.on('overlay:notify', handler);
    return () => { ipcRenderer.removeListener('overlay:notify', handler); };
  },
  onPositionChange: (callback: (position: string) => void) => {
    const handler = (_event: unknown, position: string) => callback(position);
    ipcRenderer.on('overlay:position', handler);
    return () => { ipcRenderer.removeListener('overlay:position', handler); };
  },
  getPosition: (): Promise<string> => ipcRenderer.invoke('overlay:getPosition'),
  getFontSize: (): Promise<{ name: number; offset: number }> => ipcRenderer.invoke('overlay:getFontSize'),
  onFontSizeChange: (callback: (fontSize: { name: number; offset: number }) => void) => {
    const handler = (_event: unknown, fontSize: { name: number; offset: number }) => callback(fontSize);
    ipcRenderer.on('overlay:fontSize', handler);
    return () => { ipcRenderer.removeListener('overlay:fontSize', handler); };
  },
  getMode: (): Promise<string> => ipcRenderer.invoke('overlay:getMode'),
  onModeChange: (callback: (mode: string) => void) => {
    const handler = (_event: unknown, mode: string) => callback(mode);
    ipcRenderer.on('overlay:mode', handler);
    return () => { ipcRenderer.removeListener('overlay:mode', handler); };
  },
  getEventCount: (): Promise<number> => ipcRenderer.invoke('overlay:getEventCount'),
  onEventCountChange: (callback: (count: number) => void) => {
    const handler = (_event: unknown, count: number) => callback(count);
    ipcRenderer.on('overlay:eventCount', handler);
    return () => { ipcRenderer.removeListener('overlay:eventCount', handler); };
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
