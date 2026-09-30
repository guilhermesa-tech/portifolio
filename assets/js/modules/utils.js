/**
 * Utilitários compartilhados por todos os módulos.
 *
 * Arquitetura: scripts clássicos (defer) que registram módulos em `window.GSA`.
 * Escolhido no lugar de ES modules para o site funcionar também abrindo o
 * index.html direto do disco (file://), onde módulos ES são bloqueados por CORS.
 */
(function (window, document) {
  "use strict";

  const GSA = (window.GSA = window.GSA || {});

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, t) => from + (to - from) * t;
  const mapRange = (value, inMin, inMax, outMin, outMax) =>
    outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /**
   * Ticker central: um único requestAnimationFrame alimenta todos os módulos.
   * O loop só existe enquanto houver callbacks registrados.
   */
  const ticker = (() => {
    const callbacks = new Set();
    let rafId = null;
    let last = 0;

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      callbacks.forEach((callback) => callback(dt, now));
      rafId = callbacks.size ? window.requestAnimationFrame(loop) : null;
    }

    return {
      /** Registra um callback (dt em segundos, now em ms). Retorna a função de remoção. */
      add(callback) {
        callbacks.add(callback);
        if (rafId === null) {
          last = performance.now();
          rafId = window.requestAnimationFrame(loop);
        }
        return () => callbacks.delete(callback);
      },
      remove(callback) {
        callbacks.delete(callback);
      },
    };
  })();

  /** Estado global do scroll (posição, velocidade suavizada e direção). */
  const scroll = { y: window.scrollY, velocity: 0, direction: 1 };
  let lastScrollY = scroll.y;
  ticker.add((dt) => {
    const y = window.scrollY;
    const instant = (y - lastScrollY) / Math.max(dt, 0.001);
    scroll.velocity = lerp(scroll.velocity, instant, 0.18);
    if (Math.abs(scroll.velocity) < 0.5) scroll.velocity = 0;
    if (y !== lastScrollY) scroll.direction = y > lastScrollY ? 1 : -1;
    scroll.y = y;
    lastScrollY = y;
  });

  /** Barramento de eventos entre módulos (ex.: "theme:change", "intro:done"). */
  const bus = new EventTarget();
  const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));
  const on = (name, handler) => bus.addEventListener(name, (event) => handler(event.detail));

  /**
   * Observa elementos entrando na viewport.
   * @param {Element[]} elements
   * @param {(el: Element) => void} onEnter
   * @param {{ threshold?: number, rootMargin?: string, once?: boolean, onLeave?: (el: Element) => void }} [options]
   */
  function observe(elements, onEnter, options = {}) {
    const { threshold = 0.15, rootMargin = "0px", once = true, onLeave } = options;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onEnter(entry.target);
            if (once) observer.unobserve(entry.target);
          } else if (onLeave) {
            onLeave(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );
    elements.forEach((element) => observer.observe(element));
    return observer;
  }

  /**
   * Executa `frame` no ticker apenas enquanto `element` estiver visível
   * e a aba estiver ativa — economiza CPU/bateria com canvases e demos.
   * @returns {{ isRunning: () => boolean }}
   */
  function runWhenVisible(element, frame, { rootMargin = "120px", onChange } = {}) {
    let visible = false;
    let remove = null;

    const update = () => {
      const shouldRun = visible && !document.hidden;
      if (shouldRun && !remove) remove = ticker.add(frame);
      else if (!shouldRun && remove) {
        remove();
        remove = null;
      }
      if (onChange) onChange(shouldRun);
    };

    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { rootMargin }
    ).observe(element);
    document.addEventListener("visibilitychange", update);

    return { isRunning: () => Boolean(remove) };
  }

  /**
   * "Sleep" que pausa quando o elemento sai da tela — usado pelas demos
   * roteirizadas (CI, terraform), que retomam de onde pararam.
   */
  function createPausableClock(element) {
    let visible = false;
    const waiting = [];

    const flush = () => {
      if (!visible || document.hidden) return;
      while (waiting.length) waiting.shift()();
    };

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      flush();
    }).observe(element);
    document.addEventListener("visibilitychange", flush);

    const whenVisible = () =>
      visible && !document.hidden ? Promise.resolve() : new Promise((resolve) => waiting.push(resolve));

    return {
      whenVisible,
      async sleep(ms) {
        await new Promise((resolve) => window.setTimeout(resolve, ms));
        await whenVisible();
      },
    };
  }

  /** Lê uma custom property CSS do :root (já resolvida para o tema atual). */
  const cssVar = (name, element = document.documentElement) =>
    window.getComputedStyle(element).getPropertyValue(name).trim();

  const debounce = (fn, wait = 150) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  };

  /** Canvas nítido em telas retina (DPR limitado a 2 por performance). */
  function fitCanvas(canvas, context) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height, dpr };
  }

  GSA.utils = {
    $: (selector, context = document) => context.querySelector(selector),
    $$: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
    clamp,
    lerp,
    mapRange,
    easeOutCubic,
    easeOutExpo,
    easeInOutCubic,
    observe,
    runWhenVisible,
    createPausableClock,
    cssVar,
    debounce,
    fitCanvas,
    prefersReducedMotion: () => reducedMotionQuery.matches,
    hasFinePointer: () => finePointerQuery.matches,
  };

  GSA.ticker = ticker;
  GSA.scroll = scroll;
  GSA.bus = { emit, on };

  /** Promessa resolvida quando a abertura (preloader) libera a tela. */
  GSA.intro = new Promise((resolve) => {
    GSA.resolveIntro = resolve;
  });
})(window, document);
