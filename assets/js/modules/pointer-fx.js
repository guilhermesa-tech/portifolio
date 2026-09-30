/**
 * Efeitos de ponteiro:
 *  - [data-magnetic]: o elemento é "puxado" suavemente em direção ao cursor.
 *  - [data-spotlight]: publica a posição do cursor em --sx/--sy para o
 *    brilho radial definido no CSS.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { lerp } = GSA.utils;

  function initMagnetic() {
    const elements = GSA.utils.$$("[data-magnetic]");
    const active = new Map();

    elements.forEach((element) => {
      const state = { x: 0, y: 0, tx: 0, ty: 0 };
      active.set(element, state);

      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const strength = Number(element.getAttribute("data-magnetic")) || 0.35;
        state.tx = (event.clientX - (rect.left + rect.width / 2)) * strength;
        state.ty = (event.clientY - (rect.top + rect.height / 2)) * strength;
      });

      element.addEventListener("pointerleave", () => {
        state.tx = 0;
        state.ty = 0;
      });
    });

    GSA.ticker.add(() => {
      active.forEach((state, element) => {
        const dx = state.tx - state.x;
        const dy = state.ty - state.y;
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && state.tx === 0 && state.ty === 0) {
          if (state.x !== 0 || state.y !== 0) {
            state.x = 0;
            state.y = 0;
            element.style.transform = "";
          }
          return;
        }
        state.x = lerp(state.x, state.tx, 0.16);
        state.y = lerp(state.y, state.ty, 0.16);
        element.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`;
      });
    });
  }

  function initSpotlight() {
    document.addEventListener(
      "pointermove",
      (event) => {
        const element = event.target instanceof Element ? event.target.closest("[data-spotlight]") : null;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--sx", `${event.clientX - rect.left}px`);
        element.style.setProperty("--sy", `${event.clientY - rect.top}px`);
      },
      { passive: true }
    );
  }

  function init() {
    initSpotlight();
    if (GSA.utils.hasFinePointer() && !GSA.utils.prefersReducedMotion()) initMagnetic();
  }

  GSA.pointerFx = { init };
})(window, document);
