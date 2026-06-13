import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayAPI', {
  onNotification: (callback: (payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number }) => void) => {
    const handler = (_event: unknown, payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number }) => callback(payload);
    ipcRenderer.on('overlay:notify', handler);
    return () => { ipcRenderer.removeListener('overlay:notify', handler); };
  },
});
