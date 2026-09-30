/**
 * Ponto de entrada: inicializa os módulos em ordem. Cada módulo é isolado
 * num try/catch — se um falhar, o resto do site continua funcionando.
 */
(function (window) {
  "use strict";

  const GSA = window.GSA;

  const modules = [
    ["theme", GSA.theme],
    ["header", GSA.header],
    ["reveal", GSA.reveal],
    ["hero", GSA.hero],
    ["mesh", GSA.mesh],
    ["marquee", GSA.marquee],
    ["terminal", GSA.terminal],
    ["pipeline", GSA.pipeline],
    ["projects", GSA.projects],
    ["stack", GSA.stack],
    ["globe", GSA.globe],
    ["contact", GSA.contact],
    ["footer", GSA.footer],
    ["cursor", GSA.cursor],
    ["pointerFx", GSA.pointerFx],
  ];

  modules.forEach(([name, module]) => {
    try {
      if (module && typeof module.init === "function") module.init();
    } catch (error) {
      console.error(`[GSA] falha ao iniciar o módulo "${name}":`, error);
    }
  });

  // A abertura roda por último: quando termina, libera a coreografia do hero
  try {
    GSA.preloader.start();
  } catch (error) {
    console.error("[GSA] falha no preloader:", error);
    const preloader = document.querySelector("[data-preloader]");
    if (preloader) preloader.remove();
    document.documentElement.classList.remove("is-loading");
    GSA.resolveIntro();
  }
})(window);
