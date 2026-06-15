export function Footer() {
  return (
    <footer aria-label="Footer" className="bg-dota-dark border-t border-dota-gold/20 py-6 px-4 text-center">
      <p className="text-dota-grey/60 text-sm">
        &copy; {new Date().getFullYear()} Dota 2 Announcer.{' '}
        <a
          href="https://github.com/kent-leow/dota2-announcer"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source code on GitHub"
          className="text-dota-gold hover:text-dota-amber transition-colors"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
