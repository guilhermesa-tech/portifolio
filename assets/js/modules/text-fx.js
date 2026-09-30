/**
 * Efeitos de texto: divisão em letras/palavras, "decode" (scramble),
 * máquina de escrever e proximidade de fonte variável.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { clamp, easeOutCubic } = GSA.utils;

  const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#$%&01";

  /**
   * Divide o texto de um elemento em <span class="char"> (um por letra).
   * @returns {HTMLSpanElement[]}
   */
  function splitChars(element) {
    const text = element.textContent;
    element.textContent = "";
    const chars = [];
    Array.from(text).forEach((character, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--i", String(index));
      span.textContent = character === " " ? " " : character;
      element.appendChild(span);
      chars.push(span);
    });
    return chars;
  }

  /**
   * Divide em palavras preservando elementos internos (ex.: <span class="hl">).
   * Cada palavra vira .split-word > .split-word__inner (máscara + conteúdo).
   * @param {Element} element
   * @param {{ className?: string, masked?: boolean }} [options]
   * @returns {HTMLElement[]} os elementos de cada palavra
   */
  function splitWords(element, { className = "split-word", masked = true } = {}) {
    const words = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const parts = node.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(" "));
          return;
        }
        const word = document.createElement("span");
        word.className = className;
        if (masked) {
          const inner = document.createElement("span");
          inner.className = `${className}__inner`;
          inner.textContent = part;
          word.appendChild(inner);
        } else {
          word.textContent = part;
        }
        word.style.setProperty("--i", String(words.length));
        words.push(word);
        fragment.appendChild(word);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    return words;
  }

  /**
   * Efeito "decode": letras aleatórias que se resolvem no texto final.
   * @returns {Promise<void>}
   */
  function scramble(element, finalText = element.textContent, duration = 900) {
    if (GSA.utils.prefersReducedMotion()) {
      element.textContent = finalText;
      return Promise.resolve();
    }
    if (element._scrambleFrame) window.cancelAnimationFrame(element._scrambleFrame);

    const start = performance.now();
    const length = finalText.length;

    return new Promise((resolve) => {
      const frame = (now) => {
        const progress = clamp((now - start) / duration, 0, 1);
        const revealed = Math.floor(easeOutCubic(progress) * length);
        let output = "";
        for (let i = 0; i < length; i += 1) {
          const character = finalText[i];
          if (i < revealed || character === " ") output += character;
          else output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        element.textContent = output;
        if (progress < 1) element._scrambleFrame = window.requestAnimationFrame(frame);
        else {
          element.textContent = finalText;
          element._scrambleFrame = null;
          resolve();
        }
      };
      element._scrambleFrame = window.requestAnimationFrame(frame);
    });
  }

  /**
   * Máquina de escrever em loop (digita, espera, apaga, próxima frase).
   * @param {HTMLElement} element
   * @param {string[]} phrases
   */
  function typewriter(element, phrases, { typeSpeed = 55, deleteSpeed = 28, hold = 2200 } = {}) {
    if (GSA.utils.prefersReducedMotion()) {
      element.textContent = phrases[0];
      return;
    }
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = true;
    element.textContent = phrases[0];

    const tick = () => {
      const phrase = phrases[phraseIndex];
      if (deleting) {
        charIndex -= 1;
        element.textContent = phrase.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          window.setTimeout(tick, 350);
          return;
        }
        window.setTimeout(tick, deleteSpeed);
      } else {
        const next = phrases[phraseIndex];
        charIndex += 1;
        element.textContent = next.slice(0, charIndex);
        if (charIndex >= next.length) {
          deleting = true;
          window.setTimeout(tick, hold);
          return;
        }
        window.setTimeout(tick, typeSpeed + Math.random() * 40);
      }
    };

    window.setTimeout(tick, hold);
  }

  /**
   * Fonte variável reativa à proximidade do cursor: letras perto do ponteiro
   * ganham largura ("wdth") e peso ("wght").
   * Os centros são medidos em repouso e cacheados — medir durante a animação
   * criaria um loop de realimentação (a letra alarga, o centro muda...).
   */
  function createProximity(chars, options = {}) {
    const {
      radius = 260,
      baseWidth = 96,
      maxWidth = 122,
      baseWeight = 800,
      maxWeight = 900,
      nearClass = "is-near",
      nearThreshold = 0.55,
    } = options;

    let centers = [];

    const measure = () => {
      chars.forEach((char) => {
        char.style.setProperty("--wdth", String(baseWidth));
        char.style.setProperty("--wght", String(baseWeight));
      });
      centers = chars.map((char) => {
        const rect = char.getBoundingClientRect();
        return { x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + rect.height / 2 + window.scrollY };
      });
    };

    const update = (pageX, pageY) => {
      chars.forEach((char, index) => {
        const center = centers[index];
        if (!center) return;
        const distance = Math.hypot(pageX - center.x, pageY - center.y);
        const t = easeOutCubic(clamp(1 - distance / radius, 0, 1));
        char.style.setProperty("--wdth", (baseWidth + (maxWidth - baseWidth) * t).toFixed(1));
        char.style.setProperty("--wght", (baseWeight + (maxWeight - baseWeight) * t).toFixed(0));
        char.classList.toggle(nearClass, t > nearThreshold);
      });
    };

    const reset = () => {
      chars.forEach((char) => {
        char.style.setProperty("--wdth", String(baseWidth));
        char.style.setProperty("--wght", String(baseWeight));
        char.classList.remove(nearClass);
      });
    };

    measure();
    window.addEventListener("resize", GSA.utils.debounce(measure, 200));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    return { update, reset, measure };
  }

  GSA.textFx = { splitChars, splitWords, scramble, typewriter, createProximity };
})(window, document);
