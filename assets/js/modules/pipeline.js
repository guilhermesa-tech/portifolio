/**
 * Pipeline guiado pelo scroll: o progresso da seção vira o estado de cada
 * estágio (queued → running → success), o preenchimento da trilha, o pacote
 * luminoso, o badge de status e o "tempo de execução".
 *
 * Desktop (e movimento permitido): seção pinada. Caso contrário: linha do
 * tempo vertical, com o mesmo cálculo de progresso aplicado à lista.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $, $$, clamp } = GSA.utils;
  const RUN_SECONDS = 94; // duração "fictícia" exibida no timer

  function init() {
    const section = $("[data-pipeline]");
    if (!section) return;

    const wrap = $("[data-stages-wrap]", section);
    const stages = $$("[data-stage]", section);
    const packet = $("[data-stages-packet]", section);
    const track = $(".stages__track", section);
    const badge = $("[data-run-badge]", section);
    const badgeLabel = $("[data-run-label]", section);
    const timer = $("[data-run-timer]", section);
    const total = stages.length;

    const pinQuery = window.matchMedia(
      "(min-width: 961px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)"
    );
    let pinned = false;
    let lastKey = "";

    const applyMode = () => {
      pinned = pinQuery.matches;
      section.classList.toggle("is-pinned", pinned);
      lastKey = "";
    };
    applyMode();
    pinQuery.addEventListener("change", applyMode);

    /**
     * Pinado: o progresso vem do scroll dentro da seção; cada estágio ocupa
     * 1/total dele e o nó i "roda" em [i/total, (i+1)/total).
     */
    const computePinned = () => {
      const rect = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(distance, 1), 0, 1);
      const position = progress * total;
      return {
        progress,
        current: Math.min(Math.floor(position), total - 1),
        finished: progress >= 0.995,
        // A trilha liga o 1º ao último nó: o pacote chega ao nó i quando ele começa
        fill: clamp(position / (total - 1), 0, 1),
      };
    };

    /**
     * Vertical: os estágios têm alturas diferentes, então usamos a posição real
     * de cada nó em relação a uma "linha de leitura" a 60% da viewport.
     */
    const computeVertical = () => {
      const scanY = window.innerHeight * 0.6;
      const trackRect = track.getBoundingClientRect();
      const centers = stages.map((stage) => {
        const rect = stage.querySelector(".stage__node").getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      let current = -1;
      centers.forEach((center, index) => {
        if (scanY >= center) current = index;
      });
      const lastRect = stages[total - 1].getBoundingClientRect();
      const finished = scanY >= lastRect.bottom;
      const fill = clamp((scanY - trackRect.top) / Math.max(trackRect.height, 1), 0, 1);
      const overall = clamp((scanY - centers[0]) / Math.max(lastRect.bottom - centers[0], 1), 0, 1);
      return { progress: current < 0 ? 0 : Math.max(overall, 0.005), current: Math.max(current, 0), finished, fill };
    };

    const render = () => {
      const { progress, current, finished, fill } = pinned ? computePinned() : computeVertical();
      wrap.style.setProperty("--fill", fill.toFixed(4));
      if (packet && track) {
        const offset = pinned ? fill * track.clientWidth : fill * track.clientHeight;
        packet.style.transform = pinned ? `translate3d(${offset}px, 0, 0)` : `translate3d(0, ${offset}px, 0)`;
      }

      const key = `${current}|${finished}|${pinned}`;
      if (timer) {
        const seconds = Math.round(progress * RUN_SECONDS);
        timer.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
      }
      if (key === lastKey) return;
      lastKey = key;

      stages.forEach((stage, index) => {
        let state = "queued";
        if (finished || index < current) state = "success";
        else if (index === current && progress > 0.004) state = "running";
        stage.setAttribute("data-state", state);
        stage.classList.toggle("is-current", index === current);
      });

      let runState = "queued";
      if (finished) runState = "success";
      else if (progress > 0.004) runState = "running";
      badge.setAttribute("data-state", runState);
      badgeLabel.textContent = { queued: "queued", running: "in progress", success: "success" }[runState];
    };

    GSA.utils.runWhenVisible(section, render, { rootMargin: "200px" });
    render();
  }

  GSA.pipeline = { init };
})(window, document);
