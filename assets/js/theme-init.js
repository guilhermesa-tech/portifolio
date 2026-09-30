/**
 * Roda de forma síncrona no <head>, antes do primeiro paint:
 * aplica o tema salvo (padrão: escuro) e marca que há JS disponível,
 * o que ativa as animações de entrada no CSS (progressive enhancement).
 */
(function () {
  "use strict";
  var root = document.documentElement;
  var theme = "dark";
  try {
    var saved = window.localStorage.getItem("gsa-theme");
    if (saved === "light" || saved === "dark") theme = saved;
  } catch (error) {
    /* localStorage bloqueado (modo privado etc.): segue com o padrão */
  }
  root.setAttribute("data-theme", theme);
  root.classList.add("js");
})();
