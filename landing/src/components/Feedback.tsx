const REPO_URL = 'https://github.com/kent-leow/dota2-announcer';

const categories = [
  {
    label: 'Bug Report',
    template: 'bug_report.yml',
    icon: '🐛',
    description: 'Something not working right?',
  },
  {
    label: 'Feature Request',
    template: 'feature_request.yml',
    icon: '💡',
    description: 'Have an idea to improve the app?',
  },
  {
    label: 'Question',
    template: 'question.yml',
    icon: '❓',
    description: 'Need help or clarification?',
  },
] as const;

export function Feedback() {
  return (
    <section id="feedback" aria-label="Community Feedback" className="py-20 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Community <span className="text-dota-gold">Feedback</span> for Dota 2 Announcer
        </h2>
        <p className="text-dota-grey mb-12 leading-relaxed max-w-2xl mx-auto">
          Help shape the future of this open-source Dota 2 game timer. Report bugs with voice
          alerts, suggest new Game State Integration features, or ask questions about Roshan timers,
          rune countdowns, and stack timing — your feedback drives community-driven development.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.template}
              href={`${REPO_URL}/issues/new?template=${cat.template}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Submit ${cat.label}`}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-dota-grey/20 hover:border-dota-gold/50 bg-dota-dark/50 hover:bg-dota-dark transition-colors"
            >
              <span className="text-4xl" aria-hidden="true">{cat.icon}</span>
              <span className="text-lg font-semibold text-white group-hover:text-dota-gold transition-colors">
                {cat.label}
              </span>
              <span className="text-sm text-dota-grey">{cat.description}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
