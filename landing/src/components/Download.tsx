import { useState, useEffect } from 'react';

interface ReleaseAssets {
  windows: string | null;
  mac: string | null;
  version: string | null;
}

function useLatestRelease() {
  const [assets, setAssets] = useState<ReleaseAssets>({ windows: null, mac: null, version: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.github.com/repos/kent-leow/dota2-announcer/releases/latest')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const win = data.assets?.find((a: { name: string }) => a.name.endsWith('.exe'));
        const mac = data.assets?.find((a: { name: string }) => a.name.endsWith('.dmg'));
        setAssets({
          windows: win?.browser_download_url ?? null,
          mac: mac?.browser_download_url ?? null,
          version: data.tag_name ?? null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { assets, loading };
}

const FALLBACK_URL = 'https://github.com/kent-leow/dota2-announcer/releases/latest';

export function Download() {
  const { assets, loading } = useLatestRelease();

  return (
    <section id="download" className="py-20 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to <span className="text-dota-gold">Level Up</span> Your Game?
        </h2>
        <p className="text-dota-grey mb-4 leading-relaxed">
          Available for Windows and macOS. Download the latest release below.
        </p>
        {assets.version && (
          <p className="text-dota-gold/70 text-sm mb-6">Latest: {assets.version}</p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={assets.windows ?? FALLBACK_URL}
            target={assets.windows ? undefined : '_blank'}
            rel={assets.windows ? undefined : 'noopener noreferrer'}
            className={`inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-lg transition-colors ${
              loading
                ? 'bg-dota-grey/30 text-dota-grey cursor-wait'
                : 'bg-dota-gold text-dota-black hover:bg-dota-amber'
            }`}
          >
            <span>⊞</span> Download for Windows
          </a>
          <a
            href={assets.mac ?? FALLBACK_URL}
            target={assets.mac ? undefined : '_blank'}
            rel={assets.mac ? undefined : 'noopener noreferrer'}
            className={`inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-lg transition-colors ${
              loading
                ? 'bg-dota-grey/30 text-dota-grey cursor-wait'
                : 'bg-dota-gold text-dota-black hover:bg-dota-amber'
            }`}
          >
            <span>⌘</span> Download for macOS
          </a>
        </div>
        {!loading && !assets.windows && !assets.mac && (
          <p className="text-dota-grey/60 text-sm mt-6">
            No release available yet.{' '}
            <a
              href={FALLBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dota-gold hover:text-dota-amber"
            >
              Check GitHub Releases
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
