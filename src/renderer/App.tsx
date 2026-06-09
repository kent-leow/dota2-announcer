import { useState } from 'react';
import { MainDock } from 'src/ui/main/MainDock';
import { UpcomingEvents } from 'src/ui/main/UpcomingEvents';
import { GuideModal } from 'src/ui/guide/GuideModal';

export function App() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dota-black text-dota-grey flex flex-col">
      <header className="bg-dota-dark border-b border-dota-gold/30 px-4 py-3 flex items-center justify-between">
        <h1 className="text-dota-gold text-lg font-bold tracking-wide">Dota 2 Announcer</h1>
        <button
          data-testid="help-button"
          onClick={() => setGuideOpen(true)}
          className="w-7 h-7 rounded-full border border-dota-gold/40 text-dota-gold text-sm font-bold hover:bg-dota-gold/20 transition-colors"
        >
          ?
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
        <MainDock />
        <UpcomingEvents />
      </main>

      <footer className="bg-dota-dark border-t border-dota-gold/30 px-4 py-2 text-center text-xs text-dota-grey/60">
        v0.1.0
      </footer>

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
