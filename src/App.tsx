import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { Footer } from './components/Footer';

const CasesSection = lazy(() =>
  import('./components/CasesSection').then((m) => ({ default: m.CasesSection }))
);
const StackSection = lazy(() =>
  import('./components/StackSection').then((m) => ({ default: m.StackSection }))
);
const ContactSection = lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);

// Skeleton placeholder enquanto seção carrega
function Skeleton() {
  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6" aria-hidden="true">
      <div className="h-4 w-24 bg-card mb-4 animate-pulse" />
      <div className="h-10 sm:h-12 w-64 sm:w-80 bg-card mb-8 sm:mb-12 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 sm:h-40 bg-card border-r last:border-r-0 border-border animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function PortfolioContent() {
  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      {/* Acessibilidade: skip to content */}
      <a
        href="#cases"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:text-sm focus:font-mono"
      >
        Pular para o conteúdo
      </a>

      <Header />

      <main>
        <Hero />
        <Ticker />

        <Suspense fallback={<Skeleton />}>
          <CasesSection />
        </Suspense>

        <Suspense fallback={<Skeleton />}>
          <StackSection />
        </Suspense>

        <Suspense fallback={<Skeleton />}>
          <ContactSection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <PortfolioContent />
    </ThemeProvider>
  );
}

export default App;
