import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Download } from './components/Download';
import { Footer } from './components/Footer';

export function App() {
  return (
    <div className="min-h-screen bg-dota-black text-dota-grey flex flex-col">
      <main className="flex-1">
        <Hero />
        <Features />
        <Download />
      </main>
      <Footer />
    </div>
  );
}
