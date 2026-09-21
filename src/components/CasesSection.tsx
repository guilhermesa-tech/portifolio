import { cases } from '../data/portfolio';
import { useReveal } from './ui/useInView';

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    </svg>
  );
}

export function CasesSection() {
  const [ref, visible] = useReveal();

  return (
    <section
      id="cases"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-16 sm:py-24 border-b border-border reveal ${visible ? 'visible' : ''} transition-colors duration-200`}
      aria-label="Projetos e Casos"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Título */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-12 sm:mb-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3 sm:mb-4">
              Projetos
            </p>
            <h2
              className="font-black text-ink uppercase leading-none tracking-tight transition-colors"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)' }}
            >
              OPERAÇÕES<br />
              EM DESTAQUE
            </h2>
          </div>
          <p className="text-sm text-secondary font-mono max-w-xs">
            Repositórios práticos aplicando IaC, CI/CD e Observabilidade.
          </p>
        </div>

        {/* Cards horizontais responsivos */}
        <div className="space-y-0 border border-border">
          {cases.map((c) => (
            <article
              key={c.number}
              className="group flex flex-col sm:flex-row border-b last:border-b-0 border-border bg-card hover:bg-[var(--bg-card-hover)] transition-colors duration-200 brutal-hover cursor-default"
            >
              {/* Número grande */}
              <div className="sm:w-20 flex sm:flex-col items-center justify-between sm:justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-border shrink-0">
                <span
                  className="font-black text-secondary group-hover:text-accent transition-colors duration-200 leading-none"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                >
                  {c.number}
                </span>
                <span className="sm:hidden font-mono text-xs text-secondary">
                  Case
                </span>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  {/* Título */}
                  <h3 className="text-lg sm:text-xl font-bold text-ink mb-2 group-hover:text-accent transition-colors duration-200">
                    {c.title}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed mb-4 max-w-2xl">
                    {c.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs px-2.5 py-1 border border-border bg-[var(--tag-bg)] text-ink transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Link com #050505 */}
                <div className="shrink-0 w-full sm:w-auto">
                  {c.repo ? (
                    <a
                      href={c.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-[#050505] text-white dark:bg-white dark:text-[#050505] text-xs font-semibold hover:bg-accent dark:hover:bg-accent dark:hover:text-white transition-colors w-full sm:w-auto"
                    >
                      <ExternalIcon /> Ver repo
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-2 px-5 py-3 border border-border text-secondary text-xs font-mono w-full sm:w-auto">
                      Em breve
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
