import { BrowserWindow } from 'electron';
import { onAnnouncement } from 'src/scheduler/eventScheduler';

export function initOverlayNotifier(getOverlay: () => BrowserWindow | null): void {
  onAnnouncement((eventName, offsetSeconds, eventId, icon) => {
    const overlay = getOverlay();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:notify', {
      eventName,
      offsetSeconds,
      eventId,
      icon,
      timestamp: Date.now(),
    });
  });
}
