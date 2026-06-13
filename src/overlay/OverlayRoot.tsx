import { useState, useEffect } from 'react';
import { NotificationStack } from './NotificationStack';
import { PersistentPanel } from './PersistentPanel';

export function OverlayRoot() {
  const [mode, setMode] = useState<string>('notification');

  useEffect(() => {
    if (!window.overlayAPI) return;
    window.overlayAPI.getMode().then(setMode);
    const unsub = window.overlayAPI.onModeChange(setMode);
    return unsub;
  }, []);

  if (mode === 'persistent') return <PersistentPanel />;
  return <NotificationStack />;
}
