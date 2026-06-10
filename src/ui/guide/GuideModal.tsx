import { useState } from 'react';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function GuideModal({ open, onClose }: GuideModalProps) {
  const [installing, setInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<string | null>(null);

  const handleInstallGsi = async () => {
    setInstalling(true);
    setInstallResult(null);
    const result = await window.electronAPI.gsiInstall();
    setInstalling(false);
    if (result.success) {
      setInstallResult(`Installed to: ${result.path}`);
    } else {
      setInstallResult(`Error: ${result.error}`);
    }
  };

  if (!open) return null;

  return (
    <div
      data-testid="guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        data-testid="guide-modal"
        className="bg-dota-dark border border-dota-gold/30 rounded-lg shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-dota-gold/20">
          <h2 className="text-dota-gold font-bold text-lg">User Guide</h2>
          <button
            data-testid="guide-close"
            onClick={onClose}
            className="text-dota-grey hover:text-white text-xl leading-none px-2 py-1 rounded hover:bg-dota-gold/10 transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-5 text-sm">
          <section data-testid="section-overview">
            <h3 className="text-dota-gold font-semibold mb-2">Overview</h3>
            <p className="text-dota-grey leading-relaxed">
              Dota 2 Announcer automatically detects when Dota 2 is running and announces upcoming
              game events via text-to-speech. It tracks the game timer and fires voice warnings
              before key events like rune spawns, neutral camp respawns, and day/night transitions.
            </p>
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-controls">
            <h3 className="text-dota-gold font-semibold mb-2">Controls</h3>
            <ul className="text-dota-grey space-y-1.5 list-disc list-inside">
              <li><span className="text-white font-medium">Mute/Unmute</span> — Toggle voice announcements on or off</li>
              <li><span className="text-white font-medium">Volume Slider</span> — Adjust announcement volume (0–100%)</li>
              <li><span className="text-white font-medium">Start/Stop</span> — Enable or disable the announcer</li>
              <li><span className="text-white font-medium">Reload Config</span> — Reload event configuration from disk</li>
            </ul>
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-hotkeys">
            <h3 className="text-dota-gold font-semibold mb-2">Hotkeys</h3>
            <table className="w-full text-dota-grey">
              <tbody>
                <tr className="border-b border-dota-black/40">
                  <td className="py-1.5 font-mono text-dota-amber">Ctrl+Shift+M</td>
                  <td className="py-1.5">Toggle mute</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-dota-amber">Ctrl+Shift+R</td>
                  <td className="py-1.5">Reload event configuration</td>
                </tr>
              </tbody>
            </table>
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-gsi-setup">
            <h3 className="text-dota-gold font-semibold mb-2">GSI Setup</h3>
            <p className="text-dota-grey leading-relaxed mb-2">
              To enable automatic game detection, install the Game State Integration config file:
            </p>
            <ol className="text-dota-grey space-y-1.5 list-decimal list-inside mb-3">
              <li>Click the button below to auto-install, or manually copy the config file</li>
              <li>Target: <code className="text-dota-amber bg-dota-black/40 px-1 rounded">steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration/</code></li>
              <li>Restart Dota 2 for the config to take effect</li>
            </ol>
            <button
              data-testid="gsi-install-btn"
              onClick={handleInstallGsi}
              disabled={installing}
              className="px-4 py-2 rounded font-medium text-sm bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors disabled:opacity-50"
            >
              {installing ? 'Installing...' : 'Install GSI Config'}
            </button>
            {installResult && (
              <p data-testid="gsi-install-result" className={`mt-2 text-xs ${installResult.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {installResult}
              </p>
            )}
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-config">
            <h3 className="text-dota-gold font-semibold mb-2">Event Configuration</h3>
            <p className="text-dota-grey leading-relaxed mb-2">
              Events are defined in <code className="text-dota-amber bg-dota-black/40 px-1 rounded">config/events.json</code>.
              Each event has the following fields:
            </p>
            <ul className="text-dota-grey space-y-1 list-disc list-inside">
              <li><code className="text-dota-amber">id</code> — Unique identifier</li>
              <li><code className="text-dota-amber">name</code> — Display name spoken in announcements</li>
              <li><code className="text-dota-amber">spawnTime</code> — Seconds into the game when the event first occurs</li>
              <li><code className="text-dota-amber">repeatEvery</code> — (Optional) Seconds between repetitions</li>
              <li><code className="text-dota-amber">warnings</code> — Array of offsets (in seconds) before spawn to announce</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
