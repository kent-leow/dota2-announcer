export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          type="video/webm"
          src="https://cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_webm.webm"
        />
        <source
          type="video/mp4"
          src="https://cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_02.mp4"
        />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-dota-black/60 via-dota-black/30 to-dota-black" />

      <div className="relative z-10 text-center px-4 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight">
          Dota 2 <span className="text-dota-gold">Announcer</span>
        </h1>
        <p className="text-lg md:text-xl text-dota-grey mb-8 leading-relaxed">
          Real-time voice announcements for every game event — rune spawns, neutral camps,
          day/night cycles, and more. Never miss a timing again.
        </p>
        <a
          href="#download"
          className="inline-block px-8 py-4 bg-dota-gold text-dota-black font-bold text-lg rounded-lg hover:bg-dota-amber transition-colors"
        >
          Download Now
        </a>
      </div>
    </section>
  );
}
