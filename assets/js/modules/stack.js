/**
 * Filtro da stack por categoria: as ferramentas fora do filtro esmaecem
 * (sem sumir do layout, o que evita "pulos"), as do filtro ganham a cor da marca.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $, $$ } = GSA.utils;

  function init() {
    const grid = $("[data-stack-grid]");
    if (!grid) return;
    const buttons = $$("[data-filter]");
    const tools = $$(".tool", grid);
    const status = $("[data-filter-status]");

    const apply = (filter, label) => {
      let count = 0;
      tools.forEach((tool) => {
        const match = filter === "all" || tool.getAttribute("data-category") === filter;
        if (match) count += 1;
        tool.classList.toggle("is-dim", !match);
        tool.classList.toggle("is-match", match && filter !== "all");
      });
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === filter)));
      if (status) {
        status.textContent = filter === "all" ? `Mostrando todas as ${count} ferramentas.` : `${count} ferramentas em ${label}.`;
      }
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const label = button.childNodes[0] ? button.childNodes[0].textContent.trim() : "";
        apply(button.getAttribute("data-filter"), label);
      });
    });
  }

  GSA.stack = { init };
})(window, document);
