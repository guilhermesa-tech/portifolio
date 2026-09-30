/**
 * Footer: ano automático e assinatura gigante em fonte variável que
 * "respira" na direção do cursor.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $ } = GSA.utils;

  function init() {
    const year = $("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());

    const wordmark = $("[data-wordmark]");
    if (!wordmark) return;
    const chars = GSA.textFx.splitChars(wordmark);
    if (!GSA.utils.hasFinePointer() || GSA.utils.prefersReducedMotion()) return;

    const proximity = GSA.textFx.createProximity(chars, {
      radius: 360,
      baseWidth: 100,
      maxWidth: 125,
      baseWeight: 900,
      maxWeight: 900,
      nearThreshold: 0.45,
    });

    const footer = wordmark.closest("footer") || wordmark;
    // Remede ao entrar: a página pode ter mudado de altura desde o carregamento
    GSA.utils.observe([footer], () => proximity.measure(), { once: false, threshold: 0 });
    footer.addEventListener("pointermove", (event) => proximity.update(event.pageX, event.pageY));
    footer.addEventListener("pointerleave", proximity.reset);
  }

  GSA.footer = { init };
})(window, document);
