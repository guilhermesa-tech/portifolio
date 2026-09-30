/**
 * Alternância claro/escuro com revelação circular a partir do botão
 * (View Transitions API quando disponível; fallback instantâneo).
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const STORAGE_KEY = "gsa-theme";
  const THEME_COLORS = { dark: "#07080c", light: "#f3f2ee" };

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function syncUi(button, theme) {
    const next = theme === "dark" ? "claro" : "escuro";
    button.setAttribute("aria-label", `Ativar tema ${next}`);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
  }

  function applyTheme(theme, button) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* sem persistência disponível — segue só na sessão */
    }
    syncUi(button, theme);
    GSA.bus.emit("theme:change", theme);
  }

  function init() {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    syncUi(button, currentTheme());

    button.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";

      if (!document.startViewTransition || GSA.utils.prefersReducedMotion()) {
        applyTheme(next, button);
        return;
      }

      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const transition = document.startViewTransition(() => applyTheme(next, button));
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
          );
        })
        .catch(() => {
          /* transição abortada: o tema já foi aplicado */
        });
    });
  }

  GSA.theme = { init, current: currentTheme };
})(window, document);
