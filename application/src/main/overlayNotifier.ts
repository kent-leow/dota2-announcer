import { BrowserWindow } from 'electron';
import { onAnnouncement } from 'src/scheduler/eventScheduler';
import { onRoshanEvent, RoshanEvent } from 'src/dota/roshanTracker';

function formatRoshanEventName(event: RoshanEvent): string {
  if (event.type === 'killed') return 'Roshan is dead';
  if (event.type === 'may_respawn') return 'Roshan may respawn';
  return 'Roshan has respawned';
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
      icon: 'roshan',
      timestamp: Date.now(),
    });
  });
}
