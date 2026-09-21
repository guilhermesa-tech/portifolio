import { areas } from '../data/portfolio';

// Duplicamos para looping contínuo
const ticker = [...areas, ...areas, ...areas, ...areas];

export function Ticker() {
  return (
    <div
      className="border-y border-border bg-card py-3 sm:py-4 overflow-hidden transition-colors duration-200"
      aria-label="Áreas de atuação"
    >
      <div className="ticker-track">
        {ticker.map((area, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 sm:gap-6 px-4 sm:px-8 font-mono text-xs sm:text-sm font-medium text-secondary uppercase tracking-widest whitespace-nowrap"
          >
            {area}
            <span className="text-border" aria-hidden="true">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
