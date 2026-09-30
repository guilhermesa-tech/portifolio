/**
 * Projetos: cards empilháveis (o de trás encolhe e escurece quando o próximo
 * cobre) + três demos vivas que só rodam quando visíveis:
 *   001 → execução de um workflow de CI
 *   002 → dashboard NOC com gráfico em tempo real e 29 hosts
 *   003 → terraform plan/apply sincronizado com o diagrama da AWS
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $, $$, clamp, fitCanvas } = GSA.utils;

  /* ------------------------------------------------------------------ */
  /* Empilhamento                                                        */
  /* ------------------------------------------------------------------ */
  function initStacking() {
    const container = $("[data-projects]");
    if (!container) return;
    const cards = $$("[data-project]", container);
    const inners = cards.map((card) => $(".project__inner", card));
    const stickyQuery = window.matchMedia("(min-width: 961px) and (min-height: 700px)");

    GSA.utils.runWhenVisible(container, () => {
      if (!stickyQuery.matches || GSA.utils.prefersReducedMotion()) {
        inners.forEach((inner) => {
          inner.style.transform = "";
          inner.style.removeProperty("--dim");
        });
        return;
      }
      const viewport = window.innerHeight;
      cards.forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        const stickyTop = parseFloat(window.getComputedStyle(card).top) || 0;
        const nextTop = next.getBoundingClientRect().top;
        // 0 quando o próximo card está no pé da tela; 1 quando ele encosta no topo sticky
        const t = clamp((viewport - nextTop) / Math.max(viewport - stickyTop, 1), 0, 1);
        inners[index].style.transform = `scale(${(1 - t * 0.06).toFixed(4)})`;
        inners[index].style.setProperty("--dim", (t * 0.55).toFixed(3));
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 001 — Workflow de CI                                                */
  /* ------------------------------------------------------------------ */
  function initCi() {
    const root = $("[data-ci]");
    if (!root) return;
    const jobs = $$("[data-ci-job]", root);
    const badge = $("[data-ci-badge]", root);
    const footer = $("[data-ci-footer]", root);
    const progress = $("[data-ci-progress]", root);
    const clock = GSA.utils.createPausableClock(root);
    const DURATIONS = [900, 1500, 1100, 1700, 1000, 1300];

    const setJob = (job, state, time = "") => {
      job.setAttribute("data-state", state);
      job.querySelector(".ci__time").textContent = time;
    };

    const reset = () => {
      jobs.forEach((job) => setJob(job, "queued"));
      badge.textContent = "queued";
      footer.classList.remove("is-success");
      footer.textContent = "Aguardando runner…";
      progress.style.transform = "scaleX(0)";
    };

    const showFinal = () => {
      jobs.forEach((job) => setJob(job, "success", job.getAttribute("data-time")));
      badge.textContent = "success";
      footer.classList.add("is-success");
      footer.textContent = "✓ Todas as verificações passaram · deploy em produção";
      progress.style.transform = "scaleX(1)";
    };

    if (GSA.utils.prefersReducedMotion()) {
      showFinal();
      return;
    }

    const run = async () => {
      await clock.whenVisible();
      for (;;) {
        reset();
        await clock.sleep(900);
        badge.textContent = "running";
        for (let i = 0; i < jobs.length; i += 1) {
          const job = jobs[i];
          footer.textContent = `Executando job ${i + 1} de ${jobs.length}…`;
          setJob(job, "running", "0s");
          const finalSeconds = parseInt(job.getAttribute("data-time"), 10);
          const steps = 6;
          for (let s = 1; s <= steps; s += 1) {
            await clock.sleep(DURATIONS[i] / steps);
            job.querySelector(".ci__time").textContent = `${Math.round((finalSeconds * s) / steps)}s`;
          }
          setJob(job, "success", job.getAttribute("data-time"));
          progress.style.transform = `scaleX(${(i + 1) / jobs.length})`;
        }
        badge.textContent = "success";
        footer.classList.add("is-success");
        footer.textContent = "✓ Todas as verificações passaram · deploy em produção";
        await clock.sleep(3800);
      }
    };
    run();
  }

  /* ------------------------------------------------------------------ */
  /* 002 — Dashboard NOC                                                 */
  /* ------------------------------------------------------------------ */
  function initNoc() {
    const root = $("[data-noc]");
    if (!root) return;
    const canvas = $("[data-noc-chart]", root);
    const context = canvas.getContext("2d");
    const hostsGrid = $("[data-noc-hosts]", root);
    const upValue = $("[data-noc-up]", root);
    const alertValue = $("[data-noc-alerts]", root);
    const alertWrap = $("[data-noc-alert-wrap]", root);
    const latValue = $("[data-noc-lat]", root);
    const log = $("[data-noc-log]", root);

    const HOSTS = 29;
    const POINTS = 64;
    const hosts = Array.from({ length: HOSTS }, (_, index) => {
      const cell = document.createElement("span");
      cell.className = "noc__host";
      cell.title = `cliente-${String(index + 1).padStart(2, "0")}`;
      hostsGrid.appendChild(cell);
      return cell;
    });

    // Duas séries em passeio aleatório suavizado
    const traffic = Array.from({ length: POINTS }, (_, i) => 0.55 + Math.sin(i / 6) * 0.12);
    const latency = Array.from({ length: POINTS }, (_, i) => 0.3 + Math.cos(i / 5) * 0.06);
    let size = fitCanvas(canvas, context);
    let accumulator = 0;
    let offset = 0;
    let alertTimer = 0;
    let nextAlert = 3.5;
    let activeAlert = null;

    const nextValue = (series, min, max, volatility) => {
      const last = series[series.length - 1];
      return clamp(last + (Math.random() - 0.5) * volatility, min, max);
    };

    const drawSeries = (series, color, fillAlpha, stepX) => {
      const { width, height } = size;
      context.beginPath();
      series.forEach((value, i) => {
        const x = i * stepX - offset * stepX;
        const y = height - value * (height - 14) - 4;
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = `rgba(${color}, 0.95)`;
      context.lineWidth = 1.6;
      context.stroke();
      if (fillAlpha) {
        context.lineTo(width + stepX, height);
        context.lineTo(-stepX, height);
        context.closePath();
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `rgba(${color}, ${fillAlpha})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        context.fillStyle = gradient;
        context.fill();
      }
    };

    const draw = () => {
      const { width, height } = size;
      context.clearRect(0, 0, width, height);
      // Grade de fundo
      context.strokeStyle = "rgba(255, 255, 255, 0.05)";
      context.lineWidth = 1;
      for (let i = 1; i < 4; i += 1) {
        const y = Math.round((height / 4) * i) + 0.5;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      // Linha de threshold de latência
      const thresholdY = height - 0.62 * (height - 14) - 4;
      context.setLineDash([4, 5]);
      context.strokeStyle = "rgba(255, 181, 71, 0.45)";
      context.beginPath();
      context.moveTo(0, thresholdY);
      context.lineTo(width, thresholdY);
      context.stroke();
      context.setLineDash([]);

      const stepX = width / (POINTS - 2);
      drawSeries(traffic, "198, 255, 61", 0.22, stepX);
      drawSeries(latency, activeAlert ? "255, 181, 71" : "161, 151, 255", 0, stepX);
    };

    const triggerAlert = () => {
      const index = Math.floor(Math.random() * HOSTS);
      const name = `cliente-${String(index + 1).padStart(2, "0")}`;
      activeAlert = { index, name, started: performance.now() };
      hosts[index].classList.add("is-alert");
      upValue.textContent = String(HOSTS - 1);
      alertValue.textContent = "1";
      alertWrap.classList.add("is-alert");
      log.classList.add("is-alert");
      log.textContent = `▲ alerta: ${name} · latência acima do SLO`;
    };

    const resolveAlert = () => {
      if (!activeAlert) return;
      const seconds = ((performance.now() - activeAlert.started) / 1000).toFixed(1);
      hosts[activeAlert.index].classList.remove("is-alert");
      upValue.textContent = String(HOSTS);
      alertValue.textContent = "0";
      alertWrap.classList.remove("is-alert");
      log.classList.remove("is-alert");
      log.textContent = `✓ ${activeAlert.name} recuperado · alerta resolvido em ${seconds}s`;
      activeAlert = null;
    };

    window.addEventListener(
      "resize",
      GSA.utils.debounce(() => {
        size = fitCanvas(canvas, context);
        draw();
      }, 200)
    );

    if (GSA.utils.prefersReducedMotion()) {
      latValue.textContent = "42";
      draw();
      return;
    }

    const TICK = 0.28; // s por novo ponto
    GSA.utils.runWhenVisible(root, (dt) => {
      if (!size.width) size = fitCanvas(canvas, context);
      accumulator += dt;
      offset = accumulator / TICK; // desliza suavemente entre pontos
      if (accumulator >= TICK) {
        accumulator -= TICK;
        offset = accumulator / TICK;
        traffic.push(nextValue(traffic, 0.3, 0.85, 0.12));
        const latTarget = activeAlert ? 0.78 : 0.32;
        const lastLat = latency[latency.length - 1];
        latency.push(clamp(lastLat + (latTarget - lastLat) * 0.35 + (Math.random() - 0.5) * 0.05, 0.12, 0.9));
        traffic.shift();
        latency.shift();
        latValue.textContent = String(Math.round(18 + latency[latency.length - 1] * 110));
      }

      alertTimer += dt;
      if (!activeAlert && alertTimer > nextAlert) {
        triggerAlert();
        alertTimer = 0;
      } else if (activeAlert && alertTimer > 2.2) {
        resolveAlert();
        alertTimer = 0;
        nextAlert = 4 + Math.random() * 3;
      }
      draw();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 003 — Terraform                                                     */
  /* ------------------------------------------------------------------ */
  function initTerraform() {
    const root = $("[data-tf]");
    if (!root) return;
    const term = $("[data-tf-term]", root);
    const badge = $("[data-tf-badge]", root);
    const resources = $$("[data-tf-res]", root);
    const clock = GSA.utils.createPausableClock(root);
    const MAX_LINES = 11;

    const RESOURCES = ["aws_vpc.main", "aws_subnet.public", "aws_security_group.web", "aws_instance.app", "aws_s3_bucket.assets"];
    const TIMES = ["2s", "1s", "2s", "12s", "1s"];

    const addLine = (parts) => {
      const line = document.createElement("div");
      parts.forEach(([text, cls]) => {
        const span = document.createElement("span");
        if (cls) span.className = cls;
        span.textContent = text;
        line.appendChild(span);
      });
      term.appendChild(line);
      while (term.children.length > MAX_LINES) term.firstElementChild.remove();
      return line;
    };

    const typeCommand = async (command) => {
      const line = addLine([["$ ", "t-prompt"]]);
      const text = document.createElement("span");
      text.className = "t-cmd";
      line.appendChild(text);
      for (const character of command) {
        text.textContent += character;
        await clock.sleep(38 + Math.random() * 40);
      }
      await clock.sleep(300);
    };

    const markCreated = (name, created) => {
      resources.filter((el) => el.getAttribute("data-tf-res") === name).forEach((el) => el.classList.toggle("is-created", created));
    };

    const showFinal = () => {
      RESOURCES.forEach((name) => markCreated(name, true));
      addLine([["Apply complete! ", "t-strong"], ["Resources: 5 added, 0 changed, 0 destroyed.", "t-dim"]]);
    };

    if (GSA.utils.prefersReducedMotion()) {
      showFinal();
      return;
    }

    const run = async () => {
      await clock.whenVisible();
      for (;;) {
        term.textContent = "";
        RESOURCES.forEach((name) => markCreated(name, false));
        badge.textContent = "terraform";

        await typeCommand("terraform plan");
        badge.textContent = "planning";
        for (const name of RESOURCES) {
          addLine([["  + ", "t-add"], [name, ""]]);
          await clock.sleep(160);
        }
        addLine([["Plan: ", "t-strong"], ["5 to add, 0 to change, 0 to destroy.", ""]]);
        await clock.sleep(1100);

        await typeCommand("terraform apply -auto-approve");
        badge.textContent = "applying";
        for (let i = 0; i < RESOURCES.length; i += 1) {
          await clock.sleep(i === 3 ? 1100 : 520);
          addLine([[`${RESOURCES[i]}: `, ""], [`Creation complete after ${TIMES[i]}`, "t-dim"]]);
          markCreated(RESOURCES[i], true);
        }
        await clock.sleep(300);
        addLine([["Apply complete! ", "t-strong"], ["Resources: 5 added, 0 changed, 0 destroyed.", "t-dim"]]);
        badge.textContent = "applied";
        await clock.sleep(4200);
      }
    };
    run();
  }

  function init() {
    initStacking();
    initCi();
    initNoc();
    initTerraform();
  }

  GSA.projects = { init };
})(window, document);
