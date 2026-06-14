import { useState, useEffect, useRef } from 'react';
import { NotificationStack } from './NotificationStack';
import { PersistentPanel } from './PersistentPanel';

interface OverlayConfig {
  enabled: boolean;
  position: 'left' | 'right';
  fontSize: { name: number; offset: number };
}

interface PersistentConfig extends OverlayConfig {
  eventCount: number;
}

export function OverlayRoot() {
  const [notifConfig, setNotifConfig] = useState<OverlayConfig>({ enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } });
  const [persistConfig, setPersistConfig] = useState<PersistentConfig>({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 });
  const persistHeightRef = useRef<number>(0);
  const [persistHeight, setPersistHeight] = useState(0);

  useEffect(() => {
    if (!window.overlayAPI) return;
    window.overlayAPI.getNotificationConfig().then(setNotifConfig);
    window.overlayAPI.getPersistentConfig().then(setPersistConfig);
    const unsub = window.overlayAPI.onConfigChange((config) => {
      setNotifConfig(config.notification as OverlayConfig);
      setPersistConfig(config.persistent as PersistentConfig);
    });
    return unsub;
  }, []);

  const sameSide = notifConfig.position === persistConfig.position;
  const notifOffset = sameSide && persistConfig.enabled ? persistHeight : 0;

  const handlePersistHeight = (h: number) => {
    persistHeightRef.current = h;
    setPersistHeight(h);
  };

  return (
    <>
      {persistConfig.enabled && (
        <PersistentPanel
          position={persistConfig.position}
          fontSize={persistConfig.fontSize}
          onHeightChange={handlePersistHeight}
        />
      )}
      {notifConfig.enabled && (
        <NotificationStack
          position={notifConfig.position}
          fontSize={notifConfig.fontSize}
          topOffset={notifOffset}
        />
      )}
    </>
  );
}
