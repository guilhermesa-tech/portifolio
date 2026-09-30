/**
 * Globo de pontos em canvas 2D (sem bibliotecas): continentes reais a partir
 * da máscara em data/land.js, Juara (MT) pulsando e arcos de "tráfego" até
 * regiões da AWS. Gira sozinho, aceita arrastar (com inércia) e pausa fora da tela.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { clamp, fitCanvas, cssVar, lerp } = GSA.utils;

  const DEG = Math.PI / 180;
  const HOME = { name: "Juara, MT", lat: -11.255, lon: -57.52 };
  // Cidades das regiões AWS (código → local)
  const REGIONS = [
    { code: "sa-east-1", lat: -23.55, lon: -46.63 },
    { code: "us-east-1", lat: 38.95, lon: -77.45 },
    { code: "us-west-2", lat: 45.6, lon: -121.2 },
    { code: "eu-west-1", lat: 53.35, lon: -6.26 },
    { code: "eu-central-1", lat: 50.11, lon: 8.68 },
    { code: "af-south-1", lat: -33.92, lon: 18.42 },
    { code: "ap-south-1", lat: 19.08, lon: 72.88 },
    { code: "ap-northeast-1", lat: 35.68, lon: 139.69 },
    { code: "ap-southeast-2", lat: -33.87, lon: 151.21 },
  ];

  /** Converte lat/lon em vetor unitário (mesma convenção usada ao gerar a máscara). */
  function toVector(lat, lon) {
    const phi = lat * DEG;
    const lambda = lon * DEG;
    return { x: Math.cos(phi) * Math.cos(lambda), y: Math.sin(phi), z: Math.cos(phi) * Math.sin(lambda) };
  }

  /** Regenera a grade de Fibonacci e mantém só os pontos marcados como terra. */
  function buildLandPoints() {
    const mask = GSA.landMask;
    if (!mask) return [];
    const binary = window.atob(mask.bits);
    const points = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < mask.count; i += 1) {
      if (!((binary.charCodeAt(i >> 3) >> (i & 7)) & 1)) continue;
      const y = 1 - ((i + 0.5) * 2) / mask.count;
      const radius = Math.sqrt(1 - y * y);
      const theta = i * goldenAngle;
      points.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
    }
    return points;
  }

  /** Interpolação esférica entre dois vetores unitários. */
  function slerp(a, b, t) {
    const dot = clamp(a.x * b.x + a.y * b.y + a.z * b.z, -1, 1);
    const omega = Math.acos(dot);
    if (omega < 1e-6) return { ...a };
    const sinOmega = Math.sin(omega);
    const wa = Math.sin((1 - t) * omega) / sinOmega;
    const wb = Math.sin(t * omega) / sinOmega;
    return { x: a.x * wa + b.x * wb, y: a.y * wa + b.y * wb, z: a.z * wa + b.z * wb };
  }

  function init() {
    const canvas = document.querySelector("[data-globe]");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const land = buildLandPoints();
    const home = toVector(HOME.lat, HOME.lon);

    // Arcos pré-calculados: pontos ao longo do grande círculo, "levantados" no meio
    const arcs = REGIONS.map((region, index) => {
      const target = toVector(region.lat, region.lon);
      const samples = [];
      const steps = 56;
      const dot = clamp(home.x * target.x + home.y * target.y + home.z * target.z, -1, 1);
      const lift = 0.05 + Math.acos(dot) * 0.075;
      for (let s = 0; s <= steps; s += 1) {
        const t = s / steps;
        const point = slerp(home, target, t);
        const altitude = 1 + Math.sin(t * Math.PI) * lift;
        samples.push({ x: point.x * altitude, y: point.y * altitude, z: point.z * altitude });
      }
      return { ...region, target, samples, offset: index / REGIONS.length, speed: 0.22 + (index % 3) * 0.05 };
    });

    let size = { width: 0, height: 0 };
    let colors = {};
    // Yaw que deixa Juara de frente para a câmera; pitch levemente "de baixo"
    const HOME_YAW = HOME.lon * DEG - Math.PI / 2;
    const REST_PITCH = -0.12;
    const rotation = { yaw: HOME_YAW - 0.9, pitch: REST_PITCH };
    const velocity = { yaw: 0, pitch: 0 };
    const drag = { active: false, x: 0, y: 0, lastMove: 0 };
    const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

    const readColors = () => {
      const light = GSA.theme.current() === "light";
      colors = {
        ink: cssVar("--ink-rgb") || "238, 240, 247",
        accent: cssVar("--accent-rgb") || "123, 107, 255",
        signal: light ? "61, 107, 0" : "198, 255, 61",
        light,
      };
    };

    const resize = () => {
      size = fitCanvas(canvas, context);
    };

    const project = (point, radius, cx, cy, cosYaw, sinYaw, cosPitch, sinPitch) => {
      // Gira em torno de Y (yaw) e depois em X (pitch)
      const x1 = point.x * cosYaw + point.z * sinYaw;
      const z1 = -point.x * sinYaw + point.z * cosYaw;
      const y2 = point.y * cosPitch - z1 * sinPitch;
      const z2 = point.y * sinPitch + z1 * cosPitch;
      // X invertido: com Y para cima, a parametrização lat/lon é "canhota" —
      // sem isso o mapa aparece espelhado (leste à esquerda)
      return { sx: cx - x1 * radius, sy: cy - y2 * radius, z: z2 };
    };

    /** Rótulo que "vira" para o outro lado do ponto quando encostaria na borda. */
    const drawLabel = (text, x, y, gap) => {
      const flip = x + gap + context.measureText(text).width > size.width - 4;
      context.textAlign = flip ? "right" : "left";
      context.fillText(text, flip ? x - gap : x + gap, y);
      context.textAlign = "left";
    };

    const draw = (dt = 0, now = 0) => {
      const { width, height } = size;
      if (!width) return;
      context.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.4;
      const cosYaw = Math.cos(rotation.yaw);
      const sinYaw = Math.sin(rotation.yaw);
      const cosPitch = Math.cos(rotation.pitch);
      const sinPitch = Math.sin(rotation.pitch);
      const proj = (p) => project(p, radius, cx, cy, cosYaw, sinYaw, cosPitch, sinPitch);

      // Atmosfera: transparente no miolo, mais forte na borda (efeito fresnel)
      // e esmaecendo para fora. Obs.: abaixo do raio inicial o gradiente usa a
      // cor da 1ª parada — por isso ela precisa ser transparente.
      const halo = context.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.3);
      halo.addColorStop(0, `rgba(${colors.accent}, 0)`);
      halo.addColorStop(0.571, `rgba(${colors.accent}, ${colors.light ? 0.12 : 0.2})`);
      halo.addColorStop(1, `rgba(${colors.accent}, 0)`);
      context.fillStyle = halo;
      context.beginPath();
      context.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      context.fill();

      // Contorno da esfera
      context.strokeStyle = `rgba(${colors.ink}, 0.1)`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();

      // Continentes: frente nítida, verso bem apagado (efeito "vidro")
      for (let i = 0; i < land.length; i += 1) {
        const p = proj(land[i]);
        if (p.z > 0) {
          const alpha = 0.25 + p.z * 0.6;
          context.fillStyle = `rgba(${colors.ink}, ${alpha.toFixed(3)})`;
          const s = 1 + p.z * 1.1;
          context.fillRect(p.sx - s / 2, p.sy - s / 2, s, s);
        } else if (p.z > -0.6) {
          context.fillStyle = `rgba(${colors.ink}, 0.05)`;
          context.fillRect(p.sx - 0.5, p.sy - 0.5, 1, 1);
        }
      }

      // Arcos + pacotes
      arcs.forEach((arc) => {
        const projected = arc.samples.map(proj);
        context.lineWidth = 1.3;
        for (let s = 1; s < projected.length; s += 1) {
          const a = projected[s - 1];
          const b = projected[s];
          const alpha = clamp(Math.min(a.z, b.z) * 0.9 + 0.12, 0, 0.6);
          if (alpha < 0.04) continue;
          context.strokeStyle = `rgba(${colors.accent}, ${alpha.toFixed(3)})`;
          context.beginPath();
          context.moveTo(a.sx, a.sy);
          context.lineTo(b.sx, b.sy);
          context.stroke();
        }

        // Pacote viajando Juara → região
        const t = ((now / 1000) * arc.speed + arc.offset) % 1;
        const index = Math.floor(t * (projected.length - 1));
        const packet = projected[index];
        if (packet && packet.z > -0.05) {
          context.fillStyle = `rgba(${colors.signal}, ${(0.5 + Math.sin(t * Math.PI) * 0.5).toFixed(3)})`;
          context.beginPath();
          context.arc(packet.sx, packet.sy, 2.4, 0, Math.PI * 2);
          context.fill();
        }

        // Destino: ponto + rótulo
        const end = projected[projected.length - 1];
        const target = proj(arc.target);
        if (target.z > 0.05) {
          context.fillStyle = `rgba(${colors.accent}, 0.95)`;
          context.beginPath();
          context.arc(target.sx, target.sy, 2.6, 0, Math.PI * 2);
          context.fill();
          if (target.z > 0.35) {
            context.font = "500 10px 'JetBrains Mono', monospace";
            context.fillStyle = `rgba(${colors.ink}, ${(target.z * 0.75).toFixed(3)})`;
            drawLabel(arc.code, end.sx, end.sy + 3, 7);
          }
        }
      });

      // Juara: ponto + anéis de "ping"
      const homePoint = proj(home);
      if (homePoint.z > -0.1) {
        for (let r = 0; r < 2; r += 1) {
          const pulse = ((now / 1600 + r * 0.5) % 1 + 1) % 1;
          context.strokeStyle = `rgba(${colors.signal}, ${((1 - pulse) * 0.8).toFixed(3)})`;
          context.lineWidth = 1.5;
          context.beginPath();
          context.arc(homePoint.sx, homePoint.sy, 4 + pulse * 22, 0, Math.PI * 2);
          context.stroke();
        }
        context.fillStyle = `rgb(${colors.signal})`;
        context.beginPath();
        context.arc(homePoint.sx, homePoint.sy, 4.2, 0, Math.PI * 2);
        context.fill();
        context.font = "700 11px 'JetBrains Mono', monospace";
        context.fillStyle = `rgba(${colors.ink}, 0.95)`;
        drawLabel(HOME.name, homePoint.sx, homePoint.sy - 8, 10);
      }

      // Física: fora do arraste, uma "mola" leva o globo a balançar em torno de
      // Juara (assim ela nunca fica muito tempo escondida atrás da esfera)
      if (!drag.active) {
        const targetYaw = HOME_YAW + Math.sin((now / 1000) * 0.16) * 0.8;
        const delta = wrapAngle(targetYaw - rotation.yaw);
        velocity.yaw = lerp(velocity.yaw, delta * 0.9, 0.025);
        velocity.pitch = lerp(velocity.pitch, 0, 0.06);
        rotation.pitch = lerp(rotation.pitch, REST_PITCH, 0.015);
      }
      rotation.yaw += velocity.yaw * dt;
      rotation.pitch = clamp(rotation.pitch + velocity.pitch * dt, -0.9, 0.9);
    };

    readColors();
    resize();
    window.addEventListener(
      "resize",
      GSA.utils.debounce(() => {
        resize();
        draw();
      }, 200)
    );
    GSA.bus.on("theme:change", () => {
      readColors();
      draw();
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());

    if (GSA.utils.prefersReducedMotion()) {
      draw();
      return;
    }

    // Arraste com ponteiro (mouse, toque, caneta)
    canvas.addEventListener("pointerdown", (event) => {
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.lastMove = performance.now();
      velocity.yaw = 0;
      velocity.pitch = 0;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drag.active) return;
      const now = performance.now();
      const dt = Math.max((now - drag.lastMove) / 1000, 0.008);
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      const sensitivity = 0.006;
      rotation.yaw -= dx * sensitivity;
      rotation.pitch = clamp(rotation.pitch + dy * sensitivity, -0.9, 0.9);
      velocity.yaw = (-dx * sensitivity) / dt;
      velocity.pitch = (dy * sensitivity) / dt;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.lastMove = now;
    });
    const release = (event) => {
      drag.active = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    GSA.utils.runWhenVisible(canvas, draw, { rootMargin: "80px" });
  }

  GSA.globe = { init };
})(window, document);
