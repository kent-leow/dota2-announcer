import { BrowserWindow } from 'electron';
import { onAnnouncement } from 'src/scheduler/eventScheduler';
import { onRoshanEvent, RoshanEvent } from 'src/dota/roshanTracker';

function formatRoshanEventName(event: RoshanEvent): string {
  if (event.type === 'killed') return 'Roshan Killed';
  if (event.type === 'respawn') return 'Roshan Alive';
  const minutes = Math.ceil((event.remainingSeconds ?? 0) / 60);
  return `Roshan — may respawn in ${minutes}m`;
}

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

  onRoshanEvent((event) => {
    const overlay = getOverlay();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:notify', {
      eventName: formatRoshanEventName(event),
      offsetSeconds: 0,
      eventId: 'roshan',
      timestamp: Date.now(),
    });
  });
}
