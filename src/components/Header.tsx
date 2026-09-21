import { useState, useEffect } from 'react';
import { personal } from '../data/portfolio';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { href: '#hero', label: 'Início' },
  { href: '#cases', label: 'Projetos' },
  { href: '#stack', label: 'Stack' },
  { href: '#contato', label: 'Contato' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, isDark } = useTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled ? 'bg-bg/95 backdrop-blur-sm' : 'bg-bg'
      } border-b border-border`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          className="flex items-center gap-2 sm:gap-3 group shrink-0"
          aria-label="Início"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#050505] dark:bg-white flex items-center justify-center group-hover:bg-accent dark:group-hover:bg-accent transition-colors duration-200">
            <span className="font-mono text-xs font-bold text-white dark:text-[#050505] group-hover:text-white dark:group-hover:text-white tracking-tighter">
              {personal.initials}
            </span>
          </div>
          <span className="font-mono text-xs text-secondary group-hover:text-accent tracking-widest uppercase transition-colors">
            guilherme.sa
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 h-[60px] flex items-center text-sm font-medium text-secondary hover:text-ink hover:border-b-2 hover:border-accent border-l border-border transition-all"
            >
              {link.label}
            </a>
          ))}

          {/* Seletor Segmentado de Tema: Claro / Escuro */}
          <div className="ml-4 flex items-center border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
                !isDark
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-secondary hover:text-ink'
              }`}
              title="Ativar Modo Claro"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
              <span>Claro</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
                isDark
                  ? 'bg-accent text-white font-bold shadow-sm'
                  : 'text-secondary hover:text-ink'
              }`}
              title="Ativar Modo Escuro"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
              <span>Escuro</span>
            </button>
          </div>

          {/* CTA */}
          <a
            href={`mailto:${personal.email}`}
            className="ml-4 px-5 h-9 flex items-center bg-[#050505] text-white dark:bg-white dark:text-[#050505] text-sm font-semibold rounded-none hover:bg-accent dark:hover:bg-accent dark:hover:text-white transition-colors duration-200"
          >
            Fale comigo
          </a>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Theme Toggle */}
          <div className="flex items-center border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-1.5 text-xs transition-colors cursor-pointer ${
                !isDark ? 'bg-white text-black shadow-sm' : 'text-secondary'
              }`}
              title="Modo Claro"
              aria-label="Modo Claro"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-1.5 text-xs transition-colors cursor-pointer ${
                isDark ? 'bg-accent text-white shadow-sm' : 'text-secondary'
              }`}
              title="Modo Escuro"
              aria-label="Modo Escuro"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-ink border border-border cursor-pointer"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-bg border-t border-border">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-4 text-sm font-medium text-ink border-b border-border hover:bg-card transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between px-2 py-1 text-xs font-mono text-secondary">
              <span>Tema atual:</span>
              <div className="flex items-center border border-border bg-card p-0.5">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    !isDark ? 'bg-white text-black font-bold shadow-sm' : 'text-secondary'
                  }`}
                >
                  ☀️ Claro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    isDark ? 'bg-accent text-white font-bold shadow-sm' : 'text-secondary'
                  }`}
                >
                  🌙 Escuro
                </button>
              </div>
            </div>
            <a
              href={`mailto:${personal.email}`}
              className="block w-full text-center py-3 bg-[#050505] text-white dark:bg-white dark:text-[#050505] text-sm font-semibold hover:bg-accent dark:hover:bg-accent dark:hover:text-white transition-colors"
            >
              Fale comigo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
