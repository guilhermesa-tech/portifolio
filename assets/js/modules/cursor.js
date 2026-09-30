/**
 * Cursor personalizado: ponto preciso + anel com inércia.
 * Cresce em links, mostra rótulos (data-cursor="Texto") e some em campos de texto.
 * Só ativa com ponteiro fino (mouse/trackpad) e sem prefers-reduced-motion.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { lerp } = GSA.utils;
  const INTERACTIVE = "a, button, [role='button'], label, summary, [data-cursor]";

  function init() {
    const root = document.querySelector("[data-cursor-root]");
    if (!root || !GSA.utils.hasFinePointer() || GSA.utils.prefersReducedMotion()) return;

    const dot = root.querySelector(".cursor__dot");
    const ring = root.querySelector(".cursor__ring");
    const label = root.querySelector("[data-cursor-label]");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...target };
    let hasMoved = false;

    document.documentElement.classList.add("has-cursor");
    root.classList.add("is-hidden");

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        target.x = event.clientX;
        target.y = event.clientY;
        if (!hasMoved) {
          hasMoved = true;
          ringPos.x = target.x;
          ringPos.y = target.y;
          root.classList.remove("is-hidden");
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerover", (event) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element) return;

      const isText = element.closest("input, textarea, [contenteditable='true']");
      root.classList.toggle("is-text", Boolean(isText));

      const interactive = element.closest(INTERACTIVE);
      const text = interactive && interactive.getAttribute("data-cursor");
      root.classList.toggle("is-hover", Boolean(interactive) && !text);
      root.classList.toggle("has-label", Boolean(text));
      if (text) label.textContent = text;
    });

    document.addEventListener("pointerdown", () => root.classList.add("is-down"));
    document.addEventListener("pointerup", () => root.classList.remove("is-down"));
    document.documentElement.addEventListener("pointerleave", () => root.classList.add("is-hidden"));
    document.documentElement.addEventListener("pointerenter", () => {
      if (hasMoved) root.classList.remove("is-hidden");
    });

    GSA.ticker.add(() => {
      ringPos.x = lerp(ringPos.x, target.x, 0.2);
      ringPos.y = lerp(ringPos.y, target.y, 0.2);
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    });
  }

  GSA.cursor = { init };
})(window, document);
