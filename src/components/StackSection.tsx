import { stack } from '../data/portfolio';
import { useReveal } from './ui/useInView';

export function StackSection() {
  const [ref, visible] = useReveal();

  return (
    <section
      id="stack"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-16 sm:py-24 border-b border-border reveal ${visible ? 'visible' : ''} transition-colors duration-200`}
      aria-label="Stack tecnológica"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Título */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 sm:mb-16">
          <div className="lg:col-span-6">
            <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3 sm:mb-4">
              Ferramentas
            </p>
            <h2
              className="font-black text-ink uppercase leading-none tracking-tight transition-colors"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)' }}
            >
              STACK<br />TÉCNICA
            </h2>
          </div>
          <div className="lg:col-span-6 flex items-end">
            <p className="text-secondary text-sm leading-relaxed">
              Ferramentas que utilizo no dia a dia para provisionar, automatizar, monitorar e proteger infraestrutura em produção.
            </p>
          </div>
        </div>

        {/* Grid de chips responsivo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 border border-border">
          {stack.map((item) => (
            <div
              key={item.name}
              className="p-3.5 sm:p-4 border-r border-b border-border bg-card hover:bg-[var(--bg-card-hover)] flex items-center gap-2.5 sm:gap-3 group transition-colors duration-200"
            >
              {/* Dot */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                  item.accent ? 'bg-accent' : 'bg-secondary/40 group-hover:bg-accent'
                }`}
                aria-hidden="true"
              />
              <span className="font-mono text-xs sm:text-sm font-semibold leading-none text-ink group-hover:text-accent transition-colors truncate">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Idiomas */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-border">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary">
            Idiomas:
          </span>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <span className="font-mono text-xs px-3 py-1.5 border border-border bg-[var(--tag-bg)] text-ink">
              Português — Nativo
            </span>
            <span className="font-mono text-xs px-3 py-1.5 border border-border bg-[var(--tag-bg)] text-ink">
              Inglês — Técnico (documentação)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
