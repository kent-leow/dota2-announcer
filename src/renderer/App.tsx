import { useState } from 'react';
import { MainDock } from 'src/ui/main/MainDock';
import { UpcomingEvents } from 'src/ui/main/UpcomingEvents';
import { GsiStatus } from 'src/ui/main/GsiStatus';
import { GameStatusPanel } from 'src/ui/main/GameStatusPanel';
import { TimingConfig } from 'src/ui/settings/TimingConfig';
import { SoundConfig } from 'src/ui/settings/SoundConfig';
import { GuideModal } from 'src/ui/guide/GuideModal';

type Tab = 'main' | 'settings' | 'sounds';

export function App() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('main');

  return (
    <div className="min-h-screen bg-dota-black text-dota-grey flex flex-col">
      <header className="bg-dota-dark border-b border-dota-gold/30 px-4 py-3 flex items-center justify-between">
        <h1 className="text-dota-gold text-lg font-bold tracking-wide">Dota 2 Announcer</h1>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'main'
                  ? 'bg-dota-gold/20 text-dota-gold'
                  : 'text-dota-grey/60 hover:text-dota-grey'
              }`}
            >
              Main
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-dota-gold/20 text-dota-gold'
                  : 'text-dota-grey/60 hover:text-dota-grey'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('sounds')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'sounds'
                  ? 'bg-dota-gold/20 text-dota-gold'
                  : 'text-dota-grey/60 hover:text-dota-grey'
              }`}
            >
              Sounds
            </button>
          </nav>
          <button
            data-testid="help-button"
            onClick={() => setGuideOpen(true)}
            className="w-7 h-7 rounded-full border border-dota-gold/40 text-dota-gold text-sm font-bold hover:bg-dota-gold/20 transition-colors"
          >
            ?
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
        {activeTab === 'main' && (
          <div data-testid="main-layout" className="flex flex-col lg:flex-row gap-4">
            <div data-testid="main-left" className="flex-1 flex flex-col gap-4 min-w-0">
              <MainDock />
              <GsiStatus />
              <UpcomingEvents />
            </div>
            <div data-testid="main-right" className="flex-1 min-w-0">
              <GameStatusPanel />
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <TimingConfig />
        )}
        {activeTab === 'sounds' && (
          <SoundConfig />
        )}
      </main>

      <footer className="bg-dota-dark border-t border-dota-gold/30 px-4 py-2 text-center text-xs text-dota-grey/60">
        v0.2.0
      </footer>

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
