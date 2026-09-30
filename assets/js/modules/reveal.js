/**
 * Revelações no scroll:
 *  - [data-reveal]  → recebe .is-in ao entrar na tela (CSS faz a transição)
 *  - [data-stagger] → filhos entram em cascata
 *  - [data-split]   → título quebrado em palavras que sobem de uma máscara
 *  - [data-scramble]→ texto "decodifica" ao aparecer
 *  - [data-words]   → manifesto que acende palavra por palavra conforme o scroll
 *  - [data-count]   → números contam de 0 até o valor final
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $$, observe, clamp, easeOutExpo } = GSA.utils;

  function initReveal() {
    observe($$("[data-reveal]"), (element) => element.classList.add("is-in"), {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    });
  }

  function initStagger() {
    const groups = $$("[data-stagger]");
    groups.forEach((group) => {
      Array.from(group.children).forEach((child, index) => child.style.setProperty("--n", String(index)));
    });
    observe(groups, (group) => group.classList.add("is-in"), { threshold: 0.1 });
  }

  function initSplit() {
    const headings = $$("[data-split]");
    headings.forEach((heading) => GSA.textFx.splitWords(heading));
    observe(headings, (heading) => heading.classList.add("is-in"), { threshold: 0.2 });
  }

  function initScramble() {
    observe(
      $$("[data-scramble]"),
      (element) => {
        GSA.textFx.scramble(element, element.textContent, 800);
      },
      { threshold: 0.6 }
    );

    // Links do menu: decode rápido no hover
    $$("[data-scramble-hover]").forEach((link) => {
      const original = link.textContent;
      link.addEventListener("pointerenter", () => GSA.textFx.scramble(link, original, 420));
    });
  }

  function initWords() {
    $$("[data-words]").forEach((block) => {
      const words = GSA.textFx.splitWords(block, { className: "word", masked: false });
      if (GSA.utils.prefersReducedMotion()) {
        words.forEach((word) => word.classList.add("is-lit"));
        return;
      }
      let lastLit = -1;
      GSA.utils.runWhenVisible(block, () => {
        const rect = block.getBoundingClientRect();
        const viewport = window.innerHeight;
        const progress = clamp((viewport * 0.82 - rect.top) / (rect.height + viewport * 0.3), 0, 1);
        const lit = Math.round(progress * words.length);
        if (lit === lastLit) return;
        lastLit = lit;
        words.forEach((word, index) => word.classList.toggle("is-lit", index < lit));
      });
    });
  }

  function animateCount(element) {
    const finalValue = Number(element.getAttribute("data-count"));
    const duration = 1800;
    const start = performance.now();
    const frame = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      element.textContent = String(Math.round(easeOutExpo(t) * finalValue));
      if (t < 1) window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
  }

  function initCounters() {
    if (GSA.utils.prefersReducedMotion()) return;
    const counters = $$("[data-count]");
    counters.forEach((counter) => {
      counter.textContent = "0";
    });
    observe(counters, animateCount, { threshold: 0.6 });
  }

  function init() {
    initReveal();
    initStagger();
    initSplit();
    initScramble();
    initWords();
    initCounters();
  }

  GSA.reveal = { init };
})(window, document);
