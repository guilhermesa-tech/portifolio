/**
 * Header: esconde ao descer / volta ao subir, pílula que segue a seção ativa,
 * barra de progresso do scroll e menu mobile em tela cheia.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $, $$ } = GSA.utils;

  function initSmartHeader(header, isMenuOpen) {
    const progress = $("[data-scroll-progress]");
    let lastY = window.scrollY;
    let accumulated = 0;

    GSA.ticker.add(() => {
      const y = GSA.scroll.y;
      const delta = y - lastY;
      lastY = y;

      header.classList.toggle("is-scrolled", y > 24);

      // Acumula a distância na mesma direção para evitar "piscar" em micro-scrolls
      accumulated = Math.sign(delta) === Math.sign(accumulated) ? accumulated + delta : delta;
      if (isMenuOpen() || y < 140) header.classList.remove("is-hidden");
      else if (accumulated > 18) header.classList.add("is-hidden");
      else if (accumulated < -12) header.classList.remove("is-hidden");

      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
    });

    // Foco por teclado dentro do header sempre o revela
    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  }

  function initActiveSection() {
    const list = $("[data-nav]");
    const indicator = $("[data-nav-indicator]");
    if (!list || !indicator) return;

    const links = $$(".nav__link", list);
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    let activeLink = null;

    const moveIndicator = () => {
      if (!activeLink) {
        indicator.classList.remove("is-visible");
        return;
      }
      const listRect = list.getBoundingClientRect();
      const rect = activeLink.getBoundingClientRect();
      indicator.style.setProperty("--clip-l", `${rect.left - listRect.left}px`);
      indicator.style.setProperty("--clip-r", `${listRect.right - rect.right}px`);
      indicator.classList.add("is-visible");
    };

    const setActive = (id) => {
      activeLink = links.find((link) => link.getAttribute("href") === `#${id}`) || null;
      links.forEach((link) => {
        const isActive = link === activeLink;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      moveIndicator();
    };

    // A seção "ativa" é a que cruza a faixa central da viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));

    // Topo da página (hero): nenhuma aba ativa
    const hero = $("#inicio");
    if (hero) {
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive("");
        },
        { rootMargin: "-45% 0px -50% 0px" }
      ).observe(hero);
    }

    window.addEventListener("resize", GSA.utils.debounce(moveIndicator, 120));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  }

  function initMobileMenu(header) {
    const toggle = $("[data-menu-toggle]");
    const menu = $("[data-mobile-menu]");
    if (!toggle || !menu) return () => false;

    let open = false;

    const setOpen = (value) => {
      open = value;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menu.classList.toggle("is-open", open);
      header.classList.toggle("is-menu-open", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) {
        menu.removeAttribute("inert");
        const first = menu.querySelector("a");
        if (first) window.setTimeout(() => first.focus({ preventScroll: true }), 300);
      } else {
        menu.setAttribute("inert", "");
      }
    };

    toggle.addEventListener("click", () => setOpen(!open));
    menu.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", (event) => {
      if (event.matches && open) setOpen(false);
    });

    return () => open;
  }

  function init() {
    const header = $("[data-header]");
    if (!header) return;
    const isMenuOpen = initMobileMenu(header);
    initSmartHeader(header, isMenuOpen);
    initActiveSection();
  }

  GSA.header = { init };
})(window, document);
