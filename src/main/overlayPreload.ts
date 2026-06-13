import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayAPI', {
  onNotification: (callback: (payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number }) => void) => {
    const handler = (_event: unknown, payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number }) => callback(payload);
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
});
