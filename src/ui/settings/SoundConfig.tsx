import { useState, useEffect, useCallback } from 'react';
import { EventsConfig } from 'src/config/events.schema';
import { SoundAssignment, SoundAssignments } from 'src/renderer/electron.d';
import * as soundPlayer from 'src/tts/soundPlayer';

interface EventSound {
  eventId: string;
  eventName: string;
  assignment: SoundAssignment | null;
}

export function SoundConfig() {
  const [eventSounds, setEventSounds] = useState<EventSound[]>([]);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [config, assignments] = await Promise.all([
      window.electronAPI.getEvents(),
      window.electronAPI.getSoundAssignments(),
    ]);
    const merged = config.events.map((event) => ({
      eventId: event.id,
      eventName: event.name,
      assignment: assignments[event.id] || null,
    }));
    setEventSounds(merged);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = useCallback(async (eventId: string) => {
    setError('');
    const dialogResult = await window.electronAPI.openSoundFileDialog();
    if (!dialogResult.success || dialogResult.canceled || !dialogResult.filePath) return;

    const assignResult = await window.electronAPI.assignSound(eventId, dialogResult.filePath);
    if (!assignResult.success) {
      setError(assignResult.error || 'Failed to assign sound');
      return;
    }
    await loadData();
  }, [loadData]);

  const handleRemove = useCallback(async (eventId: string) => {
    await window.electronAPI.removeSound(eventId);
    await loadData();
  }, [loadData]);

  const handlePreview = useCallback(async (eventId: string) => {
    const filePath = await window.electronAPI.getSoundFilePath(eventId);
    if (filePath) {
      soundPlayer.playSound(filePath);
    }
  }, []);

  return (
    <div className="bg-dota-dark rounded-lg p-4 space-y-4 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between">
        <h2 className="text-dota-gold text-sm font-semibold uppercase tracking-wide">Event Sounds</h2>
      </div>

      {error && (
        <p data-testid="sound-error" className="text-red-400 text-xs bg-red-400/10 rounded px-3 py-2">{error}</p>
      )}

      <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
        {eventSounds.map((es) => (
          <div
            key={es.eventId}
            data-testid={`sound-row-${es.eventId}`}
            className="rounded p-3 border border-dota-gold/20 bg-dota-black/30 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-dota-grey">{es.eventName}</span>
              <span className="ml-2 text-xs text-dota-grey/50">
                {es.assignment
                  ? `${es.assignment.type === 'bundled' ? '(default)' : '(custom)'} ${es.assignment.filename}`
                  : 'No sound'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {es.assignment && (
                <button
                  data-testid={`preview-${es.eventId}`}
                  onClick={() => handlePreview(es.eventId)}
                  className="px-2 py-1 rounded text-xs font-medium bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors"
                  title="Preview sound"
                >
                  Play
                </button>
              )}
              <button
                data-testid={`upload-${es.eventId}`}
                onClick={() => handleUpload(es.eventId)}
                className="px-2 py-1 rounded text-xs font-medium bg-green-600/20 text-green-400 border border-green-500/40 hover:bg-green-600/30 transition-colors"
                title="Upload custom sound"
              >
                Upload
              </button>
              {es.assignment && es.assignment.type === 'custom' && (
                <button
                  data-testid={`remove-${es.eventId}`}
                  onClick={() => handleRemove(es.eventId)}
                  className="px-2 py-1 rounded text-xs font-medium bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30 transition-colors"
                  title="Remove custom sound"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
