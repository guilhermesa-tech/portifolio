/**
 * Marquee infinito cuja velocidade acelera com o scroll e cuja direção
 * inverte quando o usuário rola para cima. Leve inclinação pela velocidade.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $$, clamp, lerp } = GSA.utils;
  const BASE_SPEED = 55; // px/s

  function setupBand(band) {
    const track = band.querySelector("[data-marquee-track]");
    const group = band.querySelector("[data-marquee-group]");
    if (!track || !group) return;

    const speed = Number(band.getAttribute("data-speed")) || 1;
    let groupWidth = 0;
    let x = 0;
    let skew = 0;
    let direction = 1;

    // Clona o grupo até cobrir 2× a largura da faixa (loop sem emendas)
    const fill = () => {
      Array.from(track.children)
        .slice(1)
        .forEach((clone) => clone.remove());
      groupWidth = group.getBoundingClientRect().width;
      if (!groupWidth) return;
      const needed = Math.ceil((band.clientWidth * 2) / groupWidth) + 1;
      for (let i = 1; i < needed; i += 1) {
        const clone = group.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
    };

    fill();
    window.addEventListener("resize", GSA.utils.debounce(fill, 200));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fill);

    if (GSA.utils.prefersReducedMotion()) return;

    GSA.utils.runWhenVisible(band, (dt) => {
      if (!groupWidth) return;
      const velocity = GSA.scroll.velocity;
      if (Math.abs(velocity) > 30) direction = velocity > 0 ? 1 : -1;
      const boost = 1 + Math.min(Math.abs(velocity) / 450, 6);
      x -= BASE_SPEED * speed * boost * direction * dt;
      if (x <= -groupWidth) x += groupWidth;
      else if (x > 0) x -= groupWidth;
      skew = lerp(skew, clamp(velocity / -260, -7, 7) * Math.sign(speed), 0.12);
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
    });
  }

  function init() {
    $$("[data-marquee]").forEach(setupBand);
  }

  GSA.marquee = { init };
})(window, document);
