/**
 * Contato: copiar e-mail (com fallback), toast de feedback e formulário que
 * monta um mailto: com assunto e corpo prontos (site estático, sem backend).
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $ } = GSA.utils;
  const EMAIL = "guilherme.satech@gmail.com";

  /* ------------------------------ Toast ------------------------------ */
  let toastTimer = null;
  function toast(message) {
    const element = $("[data-toast]");
    if (!element) return;
    $("[data-toast-text]", element).textContent = message;
    element.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove("is-visible"), 2600);
  }

  /* ------------------------------ Copiar ----------------------------- */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback para file:// e navegadores antigos
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand("copy");
    helper.remove();
    if (!ok) throw new Error("copy failed");
  }

  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await copyText(button.getAttribute("data-copy"));
          button.classList.add("is-copied");
          button.setAttribute("aria-label", "E-mail copiado");
          toast("E-mail copiado para a área de transferência");
          window.setTimeout(() => {
            button.classList.remove("is-copied");
            button.setAttribute("aria-label", "Copiar e-mail");
          }, 2200);
        } catch (error) {
          toast(`Não deu para copiar: ${EMAIL}`);
        }
      });
    });
  }

  /* ---------------------------- Formulário --------------------------- */
  const RULES = {
    name: { min: 2, message: "Conta seu nome (pelo menos 2 letras)." },
    message: { min: 10, message: "Escreve um pouquinho mais (mínimo de 10 caracteres)." },
  };

  function setError(field, message) {
    const error = document.getElementById(`${field.id}-error`);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message || "";
  }

  function validate(field) {
    const rule = RULES[field.name];
    const value = field.value.trim();
    const valid = !rule || value.length >= rule.min;
    setError(field, valid ? "" : rule.message);
    return valid;
  }

  function initForm() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const fields = Array.from(form.querySelectorAll("input, textarea"));
    const button = form.querySelector('button[type="submit"]');

    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value) validate(field);
      });
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const results = fields.map(validate);
      const firstInvalid = fields[results.indexOf(false)];
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const name = form.elements.name.value.trim();
      const message = form.elements.message.value.trim();
      const subject = `Contato pelo portfólio — ${name}`;
      const body = `${message}\n\n— ${name}`;
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      button.classList.remove("is-sent");
      void button.offsetWidth; // reinicia a animação do avião
      button.classList.add("is-sent");
      toast("Abrindo seu app de e-mail…");
      window.setTimeout(() => {
        window.location.href = href;
      }, 450);
    });
  }

  function init() {
    initCopy();
    initForm();
  }

  GSA.contact = { init, toast };
})(window, document);
