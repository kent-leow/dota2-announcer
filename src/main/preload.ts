import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getState: () => ipcRenderer.invoke('dota:getState'),
  onStateChange: (callback: (state: string) => void) => {
    const handler = (_event: unknown, state: string) => callback(state);
    ipcRenderer.on('dota:stateChanged', handler);
    return () => { ipcRenderer.removeListener('dota:stateChanged', handler); };
  },
  toggleMute: () => ipcRenderer.invoke('audio:toggleMute'),
  setMuted: (muted: boolean) => ipcRenderer.invoke('audio:setMuted', muted),
  isMuted: () => ipcRenderer.invoke('audio:isMuted'),
  setVolume: (value: number) => ipcRenderer.invoke('audio:setVolume', value),
  getVolume: () => ipcRenderer.invoke('audio:getVolume'),
  getEvents: () => ipcRenderer.invoke('config:getEvents'),
  reloadEvents: () => ipcRenderer.invoke('config:reloadEvents'),
});
