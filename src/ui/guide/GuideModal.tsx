interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function GuideModal({ open, onClose }: GuideModalProps) {
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
              Dota 2 Announcer detects when Dota 2 is running via Game State Integration (GSI)
              and announces upcoming game events via text-to-speech. It provides an in-game overlay
              showing event timers and fires voice warnings before key events like rune spawns,
              neutral camp respawns, and day/night transitions.
            </p>
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-controls">
            <h3 className="text-dota-gold font-semibold mb-2">Controls</h3>
            <ul className="text-dota-grey space-y-1.5 list-disc list-inside">
              <li><span className="text-white font-medium">Mute/Unmute</span> — Toggle voice announcements on or off</li>
              <li><span className="text-white font-medium">Volume Slider</span> — Adjust announcement volume (0–100%)</li>
              <li><span className="text-white font-medium">Speech Rate</span> — Control how fast announcements are spoken</li>
              <li><span className="text-white font-medium">Voice Selection</span> — Choose from available system TTS voices</li>
              <li><span className="text-white font-medium">Time Suffix</span> — Toggle spoken time remaining in announcements</li>
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

          <section data-testid="section-overlay">
            <h3 className="text-dota-gold font-semibold mb-2">Overlay</h3>
            <p className="text-dota-grey leading-relaxed mb-2">
              The in-game overlay displays event information on top of Dota 2. Two modes are available:
            </p>
            <ul className="text-dota-grey space-y-1.5 list-disc list-inside">
              <li><span className="text-white font-medium">Notification Mode</span> — Shows pop-up alerts when events are about to occur</li>
              <li><span className="text-white font-medium">Persistent Mode</span> — Shows an always-visible panel with upcoming events and countdown timers</li>
            </ul>
            <p className="text-dota-grey leading-relaxed mt-2">
              Both modes support left/right positioning and configurable font sizes.
              Use the Settings tab to adjust overlay behavior.
            </p>
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-config">
            <h3 className="text-dota-gold font-semibold mb-2">Event Configuration</h3>
            <p className="text-dota-grey leading-relaxed mb-2">
              Events can be configured directly in the Settings tab. Each event has:
            </p>
            <ul className="text-dota-grey space-y-1 list-disc list-inside">
              <li><code className="text-dota-amber">Name</code> — Display name spoken in announcements</li>
              <li><code className="text-dota-amber">Spawn Time</code> — Seconds into the game when the event first occurs</li>
              <li><code className="text-dota-amber">Repeat Every</code> — (Optional) Seconds between repetitions</li>
              <li><code className="text-dota-amber">Warnings</code> — Seconds before spawn to announce (can have multiple)</li>
              <li><code className="text-dota-amber">Sound</code> — Optional custom sound effect per event</li>
            </ul>
            <p className="text-dota-grey leading-relaxed mt-2">
              You can add, remove, and reorder events. Changes are saved automatically.
            </p>
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-gsi">
            <h3 className="text-dota-gold font-semibold mb-2">GSI Setup</h3>
            <p className="text-dota-grey leading-relaxed">
              Game State Integration connects the app to Dota 2. Use the GSI panel to install
              or uninstall the integration file automatically. When connected, the app detects
              match start/end, game clock, and day/night state from Dota 2 in real time.
            </p>
          </section>

          <hr className="border-dota-gold/10" />

          <section data-testid="section-tray">
            <h3 className="text-dota-gold font-semibold mb-2">System Tray</h3>
            <p className="text-dota-grey leading-relaxed">
              Closing the window minimizes the app to the system tray by default.
              You can choose your preferred close behavior when prompted, or reset it
              from the Settings menu. Right-click the tray icon to show the window or quit.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
