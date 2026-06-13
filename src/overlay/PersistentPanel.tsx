import { useState, useEffect } from 'react';

interface OccurrenceItem {
  eventId: string;
  eventName: string;
  happenTimeMs: number;
}

function formatCountdown(happenTimeMs: number, gameTimeMs: number): string {
  const remaining = Math.max(0, Math.floor((happenTimeMs - gameTimeMs) / 1000));
  if (remaining === 0) return 'now';
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  if (min > 0) return `${min}:${String(sec).padStart(2, '0')}`;
  return `${sec}s`;
}

export function PersistentPanel() {
  const [occurrences, setOccurrences] = useState<OccurrenceItem[]>([]);
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [align, setAlign] = useState<'left' | 'right'>('right');
  const [fontSizeName, setFontSizeName] = useState(16);
  const [fontSizeOffset, setFontSizeOffset] = useState(13);

  useEffect(() => {
    if (!window.overlayAPI) return;
    window.overlayAPI.getPosition().then((pos) => {
      setAlign(pos === 'left-center' ? 'left' : 'right');
    });
    window.overlayAPI.getFontSize().then((fs) => {
      setFontSizeName(fs.name);
      setFontSizeOffset(fs.offset);
    });
    const unsubUpcoming = window.overlayAPI.onUpcoming((occ) => {
      setOccurrences(occ);
    });
    const unsubTick = window.overlayAPI.onTick((ms) => {
      setGameTimeMs(ms);
    });
    const unsubPos = window.overlayAPI.onPositionChange((pos) => {
      setAlign(pos === 'left-center' ? 'left' : 'right');
    });
    const unsubFontSize = window.overlayAPI.onFontSizeChange((fs) => {
      setFontSizeName(fs.name);
      setFontSizeOffset(fs.offset);
    });
    return () => {
      unsubUpcoming();
      unsubTick();
      unsubPos();
      unsubFontSize();
    };
  }, []);

  const visible = occurrences.filter((o) => o.happenTimeMs > gameTimeMs);

  if (visible.length === 0) return null;

  return (
    <div className={`persistent-panel persistent-panel--${align}`}>
      {visible.map((o) => (
        <div key={`${o.eventId}:${o.happenTimeMs}`} className="persistent-panel__item">
          <span className="persistent-panel__name" style={{ fontSize: `${fontSizeName}px` }}>{o.eventName}</span>
          <span className="persistent-panel__countdown" style={{ fontSize: `${fontSizeOffset}px` }}>{formatCountdown(o.happenTimeMs, gameTimeMs)}</span>
        </div>
      ))}
    </div>
  );
}
