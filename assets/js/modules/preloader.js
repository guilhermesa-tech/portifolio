/**
 * Abertura em forma de "deploy": log de boot + contador 000→100 e
 * cortinas que se abrem. Roda completa só na primeira visita da sessão;
 * nas seguintes é uma transição curta. Clique ou Esc pulam.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { clamp, easeInOutCubic } = GSA.utils;
  const SESSION_KEY = "gsa-booted";
  const DURATION = 2300;

  const LOG = [
    { at: 0, cls: "is-cmd", text: "guilherme@infra:~$ ./deploy --env=production" },
    { at: 0.14, cls: "is-ok", ok: true, text: "terraform apply — infraestrutura provisionada" },
    { at: 0.36, cls: "is-ok", ok: true, text: "github actions — build e testes aprovados" },
    { at: 0.56, cls: "is-ok", ok: true, text: "docker / k8s — containers em execução" },
    { at: 0.76, cls: "is-ok", ok: true, text: "prometheus / grafana — observabilidade online" },
    { at: 0.95, cls: "is-done", text: "→ deploy concluído. bem-vindo." },
  ];

  function alreadyBooted() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function markBooted() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch (error) {
      /* ignora: só significa que a abertura completa pode repetir */
    }
  }

  function appendLine(container, entry) {
    const line = document.createElement("p");
    line.className = entry.cls;
    if (entry.ok) {
      const tag = document.createElement("b");
      tag.textContent = "[ OK ] ";
      line.appendChild(tag);
    }
    line.appendChild(document.createTextNode(entry.text));
    container.appendChild(line);
  }

  /** Espera as fontes (com teto) para o nome do hero não "pular" ao animar. */
  function fontsReady(timeout = 1500) {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return Promise.race([document.fonts.ready, new Promise((resolve) => window.setTimeout(resolve, timeout))]);
  }

  function finish(root) {
    root.classList.add("is-exiting");
    document.documentElement.classList.remove("is-loading");
    GSA.resolveIntro();
    GSA.bus.emit("intro:done");
    window.setTimeout(() => root.remove(), 1300);
  }

  function start() {
    const root = document.querySelector("[data-preloader]");
    if (!root) {
      GSA.resolveIntro();
      return;
    }

    // Movimento reduzido: sem abertura nenhuma
    if (GSA.utils.prefersReducedMotion()) {
      root.remove();
      GSA.resolveIntro();
      return;
    }

    document.documentElement.classList.add("is-loading");

    // Visitas seguintes na mesma sessão: só as cortinas, rápido
    if (alreadyBooted()) {
      root.classList.add("is-quick");
      root.querySelector(".preloader__inner").style.opacity = "0";
      fontsReady(900).then(() => window.requestAnimationFrame(() => finish(root)));
      return;
    }

    const log = root.querySelector("[data-preloader-log]");
    const count = root.querySelector("[data-preloader-count]");
    const bar = root.querySelector("[data-preloader-bar]");
    const startTime = performance.now();
    let printed = 0;
    let done = false;

    const complete = () => {
      if (done) return;
      done = true;
      markBooted();
      fontsReady().then(() => finish(root));
    };

    const frame = (now) => {
      if (done) return;
      const progress = clamp((now - startTime) / DURATION, 0, 1);
      const eased = easeInOutCubic(progress);
      count.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      bar.style.transform = `scaleX(${eased})`;
      while (printed < LOG.length && progress >= LOG[printed].at) {
        appendLine(log, LOG[printed]);
        printed += 1;
      }
      if (progress < 1) window.requestAnimationFrame(frame);
      else window.setTimeout(complete, 260);
    };
    window.requestAnimationFrame(frame);

    const skip = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      complete();
      window.removeEventListener("keydown", skip);
    };
    root.addEventListener("click", complete, { once: true });
    window.addEventListener("keydown", skip);
  }

  GSA.preloader = { start };
})(window, document);
