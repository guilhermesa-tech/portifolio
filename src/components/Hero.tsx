import { personal } from '../data/portfolio';

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-[85vh] pt-[60px] flex flex-col border-b border-border transition-colors duration-200"
      aria-label="Apresentação"
    >
      {/* Grid central */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col justify-center py-12 sm:py-20 lg:py-24">
        {/* Headline brutalista e responsiva */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3 sm:mb-4">
              DevOps &amp; SRE Engineer
            </p>
            <h1
              className="font-sans font-black text-ink leading-[0.95] tracking-[-0.03em] uppercase break-words transition-colors"
              style={{ fontSize: 'clamp(2.5rem, 7.5vw, 6.5rem)' }}
            >
              DEVOPS,<br />
              CLOUD &amp;<br />
              <span className="text-accent">AUTOMATION</span>
            </h1>
          </div>

          {/* Painel lateral */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Bio */}
            <p className="text-secondary text-sm sm:text-base leading-relaxed border-l-2 border-accent pl-4 transition-colors">
              {personal.bio}
            </p>

            {/* CTAs com #050505 e Branco */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="#cases"
                className="px-6 py-3 bg-[#050505] text-white dark:bg-white dark:text-[#050505] text-sm font-semibold text-center hover:bg-accent dark:hover:bg-accent dark:hover:text-white transition-colors duration-200"
              >
                Ver Projetos →
              </a>
              <a
                href={`mailto:${personal.email}`}
                className="px-6 py-3 border border-[#050505] text-[#050505] dark:border-white dark:text-white text-sm font-semibold text-center hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent transition-colors duration-200"
              >
                Entrar em Contato
              </a>
            </div>

            {/* Meta info */}
            <div className="flex flex-col gap-1 font-mono text-xs text-secondary">
              <span className="truncate">📍 {personal.location}</span>
              <span className="truncate">✉ {personal.email}</span>
            </div>
          </div>
        </div>

        {/* Diagrama técnico decorativo */}
        <div
          className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-0 border border-border bg-card transition-colors"
          aria-hidden="true"
        >
          {[
            { label: 'Cloud', value: 'AWS / IaC', color: 'border-accent' },
            { label: 'CI/CD', value: 'GitHub Actions', color: '' },
            { label: 'Containers', value: 'Docker / K8s', color: '' },
            { label: 'Observabilidade', value: 'Prometheus / Grafana', color: '' },
          ].map((item, i) => (
            <div
              key={i}
              className={`p-3 sm:p-5 border-r border-b lg:border-b-0 border-border ${
                i % 2 === 1 ? 'border-r-0 lg:border-r' : ''
              } ${i === 3 ? 'lg:border-r-0' : ''} ${i === 0 ? `border-t-2 ${item.color}` : ''}`}
            >
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-secondary mb-1">
                {item.label}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-ink truncate">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
