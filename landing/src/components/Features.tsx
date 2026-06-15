const FEATURES = [
  {
    icon: '🔊',
    title: 'Real-time Voice Announcements',
    description:
      'Text-to-speech warns you before every key event — rune spawns, neutral camps, siege creeps, and more.',
  },
  {
    icon: '🎮',
    title: 'Dual Overlay Modes',
    description:
      'Notification pop-ups for quick alerts or a persistent panel with countdown timers — choose what fits your playstyle.',
  },
  {
    icon: '⚙️',
    title: '12 Configurable Events',
    description:
      'Bounty, Water, Power, Wisdom, Lotus Runes, Day/Night, Neutral Camps, Tormentor, Aghanim Shard, Siege & Flagbearer Creeps.',
  },
  {
    icon: '🎙️',
    title: 'TTS Customisation',
    description:
      'Pick your voice, adjust speech rate and volume, toggle time suffix — make it sound exactly how you want.',
  },
  {
    icon: '⌨️',
    title: 'Global Hotkeys',
    description:
      'Ctrl+Shift+M to toggle mute, Ctrl+Shift+R to reload config — control the app without leaving your game.',
  },
  {
    icon: '📌',
    title: 'System Tray Integration',
    description:
      'Minimizes to tray on close. Right-click to show or quit — stays out of your way until you need it.',
  },
  {
    icon: '🔗',
    title: 'GSI Auto-Setup',
    description:
      'One-click Game State Integration install. Automatically detects match start, game clock, and day/night state.',
  },
];

export function Features() {
  return (
    <section aria-label="Features" className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
        Everything You Need to <span className="text-dota-gold">Never Miss a Timing</span>
      </h2>
      <p className="text-center text-dota-grey mb-12 max-w-2xl mx-auto">
        A desktop companion that connects to Dota 2 via Game State Integration and keeps you informed in real time.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-dota-dark border border-dota-gold/20 rounded-lg p-6 hover:border-dota-gold/50 transition-colors"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-dota-grey text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
