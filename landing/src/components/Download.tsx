export function Download() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to <span className="text-dota-gold">Level Up</span> Your Game?
        </h2>
        <p className="text-dota-grey mb-4 leading-relaxed">
          Available for Windows and macOS. Download the latest release from GitHub.
        </p>
        <p className="text-dota-grey/60 text-sm mb-8">
          Install, launch, and the app auto-connects to Dota 2 via Game State Integration.
        </p>
        <a
          href="https://github.com/kent-leow/dota2-announcer/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 bg-dota-gold text-dota-black font-bold text-lg rounded-lg hover:bg-dota-amber transition-colors"
        >
          Download Latest Release
        </a>
      </div>
    </section>
  );
}
