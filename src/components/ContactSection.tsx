import { useState } from 'react';
import { personal } from '../data/portfolio';
import { useReveal } from './ui/useInView';

export function ContactSection() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    window.location.href = `mailto:${personal.email}?subject=Contato via portfólio&body=Olá Guilherme, meu email é: ${email}`;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const [ref, visible] = useReveal();

  return (
    <section
      id="contato"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-16 sm:py-24 border-b border-border bg-card reveal ${visible ? 'visible' : ''} transition-colors duration-200`}
      aria-label="Contato"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3 sm:mb-4">
              Contato
            </p>
            <h2
              className="font-black text-ink uppercase leading-none tracking-tight mb-6 sm:mb-8 transition-colors break-words"
              style={{ fontSize: 'clamp(2.25rem, 6.5vw, 5.5rem)' }}
            >
              VAMOS CONSTRUIR<br />
              SISTEMAS<br />
              <span className="text-accent">CONFIÁVEIS.</span>
            </h2>
            <p className="text-secondary text-sm sm:text-base leading-relaxed max-w-md mb-6 sm:mb-8 transition-colors">
              Disponível para posições de DevOps / Cloud Júnior. Respondo em até 24 horas.
            </p>

            {/* Email direto */}
            <a
              href={`mailto:${personal.email}`}
              className="inline-flex items-center gap-2 sm:gap-3 text-ink font-mono text-xs sm:text-sm border-b-2 border-accent pb-1 hover:text-accent transition-colors"
            >
              <span>{personal.email}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Right — form + links */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            {/* Email capture form */}
            <div className="border border-border bg-[var(--tag-bg)] p-1 transition-colors">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-stretch gap-0"
                aria-label="Enviar email de contato"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="flex-1 bg-transparent px-4 py-3.5 sm:py-4 font-mono text-sm text-ink placeholder:text-secondary outline-none"
                  aria-label="Seu endereço de email"
                />
                <button
                  type="submit"
                  className="h-12 sm:h-auto sm:w-14 bg-[#050505] text-white dark:bg-white dark:text-[#050505] hover:bg-accent dark:hover:bg-accent dark:hover:text-white transition-colors duration-200 flex items-center justify-center shrink-0 cursor-pointer font-medium text-sm sm:text-base"
                  aria-label="Enviar email"
                >
                  <span className="sm:hidden mr-2">Enviar</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </form>
            </div>

            {sent && (
              <p className="font-mono text-xs text-accent">
                ✓ Abrindo seu cliente de email…
              </p>
            )}

            {/* Social links */}
            <div className="space-y-2.5 sm:space-y-3">
              {[
                { label: 'GitHub', value: 'guilhermesa-tech', href: personal.github },
                { label: 'LinkedIn', value: 'guilhermesantosdearaujo', href: personal.linkedin },
                { label: 'Telefone', value: personal.phone, href: `tel:${personal.phone.replace(/\D/g, '')}` },
                { label: 'Localização', value: personal.location, href: null },
              ].map((l) => (
                <div
                  key={l.label}
                  className="flex items-center justify-between py-2.5 sm:py-3 border-b border-border transition-colors text-xs sm:text-sm"
                >
                  <span className="font-mono text-xs text-secondary uppercase tracking-wider">
                    {l.label}
                  </span>
                  {l.href ? (
                    <a
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="font-mono text-xs sm:text-sm text-ink hover:text-accent transition-colors truncate max-w-[200px] sm:max-w-none"
                    >
                      {l.value} ↗
                    </a>
                  ) : (
                    <span className="font-mono text-xs sm:text-sm text-secondary">{l.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
