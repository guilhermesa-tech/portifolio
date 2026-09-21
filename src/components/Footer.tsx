import { personal } from '../data/portfolio';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border transition-colors duration-200" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Nome */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#050505] dark:bg-white flex items-center justify-center shrink-0">
              <span className="font-mono text-[9px] font-bold text-white dark:text-[#050505]">GSA</span>
            </div>
            <span className="font-mono text-xs text-secondary">
              © {year} Guilherme Santos de Araújo
            </span>
          </div>

          {/* Stack */}
          <span className="font-mono text-[10px] sm:text-xs text-secondary">
            React + TypeScript + Tailwind CSS
          </span>

          {/* Links */}
          <div className="flex items-center gap-5 sm:gap-6">
            <a
              href={personal.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-secondary hover:text-accent transition-colors"
            >
              GitHub
            </a>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-secondary hover:text-accent transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${personal.email}`}
              className="font-mono text-xs text-secondary hover:text-accent transition-colors"
            >
              E-mail
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
