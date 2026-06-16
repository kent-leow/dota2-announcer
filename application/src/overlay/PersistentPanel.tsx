import { useState, useEffect, useRef } from 'react';
import { PLACEHOLDER_ICON } from 'src/config/defaultIcons';

interface OccurrenceItem {
  eventId: string;
  eventName: string;
  happenTimeMs: number;
  icon?: string;
}

interface PersistentPanelProps {
  position: 'left' | 'right';
  fontSize: { name: number; offset: number };
  onHeightChange: (height: number) => void;
}

function formatCountdown(happenTimeMs: number, gameTimeMs: number): string {
  const happenSec = Math.floor(happenTimeMs / 1000);
  const currentSec = Math.floor(gameTimeMs / 1000);
  const remaining = Math.max(0, happenSec - currentSec);
  if (remaining === 0) return 'now';
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  if (min > 0) return `in ${min}:${String(sec).padStart(2, '0')}`;
  return `in ${sec}s`;
}

function formatSpawnTime(happenTimeMs: number): string {
  const totalSeconds = Math.floor(happenTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `@${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PersistentPanel({ position, fontSize, onHeightChange }: PersistentPanelProps) {
  const [occurrences, setOccurrences] = useState<OccurrenceItem[]>([]);
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.overlayAPI) return;
    const unsubUpcoming = window.overlayAPI.onUpcoming((occ) => {
      setOccurrences(occ);
    });
    const unsubTick = window.overlayAPI.onTick((ms) => {
      setGameTimeMs(ms);
    });
    return () => {
      unsubUpcoming();
      unsubTick();
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      onHeightChange(containerRef.current.offsetHeight);
    }
  });

  const visible = occurrences.filter((o) => o.happenTimeMs > gameTimeMs);

  if (visible.length === 0) {
    onHeightChange(0);
    return null;
  }

  return (
    <div ref={containerRef} className={`persistent-panel persistent-panel--${position}`}>
      <div className="persistent-panel__box">
        {visible.map((o) => (
          <div key={`${o.eventId}:${o.happenTimeMs}`} className="persistent-panel__item">
            <img
              className="persistent-panel__icon"
              src={o.icon || PLACEHOLDER_ICON}
              alt=""
              width={20}
              height={20}
            />
            <span className="persistent-panel__name" style={{ fontSize: `${fontSize.name}px` }}>{o.eventName}</span>
            <span className="persistent-panel__timing">
              <span className="persistent-panel__countdown" style={{ fontSize: `${fontSize.offset}px` }}>{formatCountdown(o.happenTimeMs, gameTimeMs)}</span>
              <span className="persistent-panel__spawn" style={{ fontSize: `${fontSize.offset - 2}px` }}>{formatSpawnTime(o.happenTimeMs)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
