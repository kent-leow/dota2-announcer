import { BrowserWindow } from 'electron';
import { onAnnouncement } from 'src/scheduler/eventScheduler';
import { onRoshanEvent, RoshanEvent } from 'src/dota/roshanTracker';
import { onWarning } from 'src/dota/mapAwarenessTracker';
import { overlayTitle, overlayOffsetSeconds } from 'src/dota/mapAwareness/messages';
import { MAP_AWARENESS_EVENT_ID } from 'src/dota/mapAwareness/constants';
import { MAP_AWARENESS_ICON } from 'src/config/defaultIcons';

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
      timestamp: Date.now(),
    });
  });

  onWarning((warning) => {
    const overlay = getOverlay();
    if (!overlay || overlay.isDestroyed()) return;
    overlay.webContents.send('overlay:notify', {
      eventName: overlayTitle(warning),
      offsetSeconds: overlayOffsetSeconds(warning),
      eventId: MAP_AWARENESS_EVENT_ID,
      icon: MAP_AWARENESS_ICON,
      happenTimeMs: Math.round((warning.clockTime + warning.etaSeconds) * 1000),
      timestamp: Date.now(),
    });
  });
}
