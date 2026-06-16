import { useState, useEffect, useRef } from 'react';
import { NotificationStack } from './NotificationStack';
import { PersistentPanel } from './PersistentPanel';
import { sizeToPixels, DEFAULT_OVERLAY_SIZE } from 'src/config/overlaySize';

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
  const [overlaySize, setOverlaySize] = useState(DEFAULT_OVERLAY_SIZE);
  const persistHeightRef = useRef<number>(0);
  const [persistHeight, setPersistHeight] = useState(0);

  useEffect(() => {
    if (!window.overlayAPI) return;
    window.overlayAPI.getNotificationConfig().then(setNotifConfig);
    window.overlayAPI.getPersistentConfig().then(setPersistConfig);
    window.overlayAPI.getOverlaySize().then(setOverlaySize);
    const unsub = window.overlayAPI.onConfigChange((config) => {
      setNotifConfig(config.notification as OverlayConfig);
      setPersistConfig(config.persistent as PersistentConfig);
      if (typeof config.overlaySize === 'number') setOverlaySize(config.overlaySize);
    });
    return unsub;
  }, []);

  const px = sizeToPixels(overlaySize);
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
          fontSize={{ name: px.name, offset: px.offset }}
          iconSize={px.icon}
          spawnFontSize={px.spawn}
          onHeightChange={handlePersistHeight}
        />
      )}
      {notifConfig.enabled && (
        <NotificationStack
          position={notifConfig.position}
          fontSize={{ name: px.name, offset: px.offset }}
          iconSize={px.icon}
          topOffset={notifOffset}
        />
      )}
    </>
  );
}
