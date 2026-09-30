/**
 * Hero: coreografia de entrada, nome em fonte variável reativa ao cursor,
 * máquina de escrever, retrato com tilt 3D + reflexo e chips em parallax.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $, $$, lerp, clamp } = GSA.utils;

  const ROLES = [
    "DevOps & SRE Engineer",
    "Cloud · CI/CD · Automação",
    "Infraestrutura como código",
    "Sistemas que não podem parar",
  ];

  function initPortraitFallback() {
    const portrait = $("[data-portrait]");
    const image = $("[data-portrait-img]");
    if (!portrait || !image) return;
    const fail = () => portrait.classList.add("is-fallback");
    if (image.complete && image.naturalWidth === 0) fail();
    image.addEventListener("error", fail);
  }

  function init() {
    const hero = $("[data-hero]");
    if (!hero) return;

    initPortraitFallback();

    const nameElement = $("[data-hero-name]", hero);
    const chars = nameElement ? GSA.textFx.splitChars(nameElement) : [];

    GSA.intro.then(() => {
      hero.classList.add("is-loaded");
      const typed = $("[data-typewriter]", hero);
      if (typed) window.setTimeout(() => GSA.textFx.typewriter(typed, ROLES), 1200);
    });

    if (!GSA.utils.hasFinePointer() || GSA.utils.prefersReducedMotion()) return;

    const proximity = GSA.textFx.createProximity(chars, { radius: 280, baseWidth: 96, maxWidth: 116 });
    const spot = $("[data-hero-spot]", hero);
    const visual = $("[data-hero-visual]", hero);
    const portrait = $("[data-portrait]", hero);
    const card = $("[data-portrait-card]", hero);
    const glare = $("[data-portrait-glare]", hero);
    const orbitItems = $$(".orbit__item", hero).map((element) => ({
      element,
      depth: Number(element.getAttribute("data-depth")) || 1,
    }));

    // Estado alvo (atualizado nos eventos) e estado suavizado (atualizado no ticker)
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, nx: 0, ny: 0 };
    const smooth = { x: pointer.x, y: pointer.y, nx: 0, ny: 0, rx: 0, ry: 0 };
    const tilt = { rx: 0, ry: 0, active: false };
    // As letras entram deslocadas; só medimos os centros depois da animação
    let introDone = false;
    GSA.intro.then(() =>
      window.setTimeout(() => {
        proximity.measure();
        introDone = true;
      }, 1500)
    );

    hero.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.nx = event.clientX / window.innerWidth - 0.5;
      pointer.ny = event.clientY / window.innerHeight - 0.5;
      hero.classList.add("is-pointer");
      if (introDone) proximity.update(event.pageX, event.pageY);
    });

    hero.addEventListener("pointerleave", () => {
      pointer.nx = 0;
      pointer.ny = 0;
      hero.classList.remove("is-pointer");
      proximity.reset();
    });

    if (visual && card) {
      visual.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        tilt.ry = (px - 0.5) * 16;
        tilt.rx = (0.5 - py) * 14;
        tilt.active = true;
        portrait.classList.add("is-tilting");
        glare.style.setProperty("--gx", `${px * 100}%`);
        glare.style.setProperty("--gy", `${py * 100}%`);
      });
      visual.addEventListener("pointerleave", () => {
        tilt.rx = 0;
        tilt.ry = 0;
        tilt.active = false;
        portrait.classList.remove("is-tilting");
      });
    }

    GSA.utils.runWhenVisible(hero, () => {
      smooth.x = lerp(smooth.x, pointer.x, 0.08);
      smooth.y = lerp(smooth.y, pointer.y, 0.08);
      smooth.nx = lerp(smooth.nx, pointer.nx, 0.06);
      smooth.ny = lerp(smooth.ny, pointer.ny, 0.06);
      smooth.rx = lerp(smooth.rx, tilt.rx, 0.1);
      smooth.ry = lerp(smooth.ry, tilt.ry, 0.1);

      if (spot) {
        const rect = hero.getBoundingClientRect();
        spot.style.transform = `translate3d(${smooth.x - rect.left}px, ${smooth.y - rect.top}px, 0)`;
      }
      if (card) {
        card.style.setProperty("--rx", `${smooth.rx.toFixed(2)}deg`);
        card.style.setProperty("--ry", `${smooth.ry.toFixed(2)}deg`);
      }
      orbitItems.forEach(({ element, depth }) => {
        const x = smooth.nx * depth * -26;
        const y = smooth.ny * depth * -22;
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
    });
  }

  GSA.hero = { init };
})(window, document);
