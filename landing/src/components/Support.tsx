export function Support() {
  return (
    <section id="support" aria-label="Support" className="py-20 px-4 text-center bg-dota-dark">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Support the <span className="text-dota-gold">Project</span>
        </h2>
        <p className="text-dota-grey mb-8 leading-relaxed">
          Dota 2 Announcer is free and open source. If it helps your game, consider buying me a
          coffee to keep development going.
        </p>
        <a
          href="https://ko-fi.com/kentleow"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Support on Ko-fi"
          className="inline-flex items-center gap-2 px-8 py-4 bg-dota-gold text-dota-black font-bold text-lg rounded-lg hover:bg-dota-amber transition-colors"
        >
          ☕ Buy Me a Coffee
        </a>
      </div>
    </section>
  );
}
