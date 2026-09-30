/**
 * Malha de rede do hero ("service mesh"): nós à deriva que se conectam por
 * proximidade, pacotes luminosos trafegando pelas arestas e o cursor agindo
 * como mais um nó da rede. Pausa fora da tela e respeita reduced-motion.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { clamp, fitCanvas, cssVar } = GSA.utils;

  const LINK_DISTANCE = 150;
  const MOUSE_DISTANCE = 190;
  const PACKET_RATE = 2.6; // pacotes por segundo

  /** Sprite pré-renderizado de brilho — drawImage é bem mais barato que shadowBlur. */
  function createGlowSprite(rgb) {
    const size = 48;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = size;
    const context = sprite.getContext("2d");
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${rgb}, 1)`);
    gradient.addColorStop(0.18, `rgba(${rgb}, 0.9)`);
    gradient.addColorStop(0.4, `rgba(${rgb}, 0.25)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return sprite;
  }

  function init() {
    const canvas = document.querySelector("[data-mesh]");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const hero = canvas.closest("[data-hero]") || canvas.parentElement;

    let width = 0;
    let height = 0;
    let nodes = [];
    let packets = [];
    let edges = [];
    let spawnDebt = 0;
    let colors = {};
    let glow = null;
    const mouse = { x: -9999, y: -9999, active: false };

    const readColors = () => {
      colors = {
        ink: cssVar("--ink-rgb") || "238, 240, 247",
        accent: cssVar("--accent-rgb") || "123, 107, 255",
        isLight: GSA.theme.current() === "light",
      };
      glow = createGlowSprite(colors.isLight ? "74, 58, 255" : "198, 255, 61");
    };

    const createNodes = () => {
      const count = clamp(Math.round((width * height) / 15000), 26, 96);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        r: Math.random() * 1.4 + 0.8,
        hub: Math.random() < 0.08,
        phase: Math.random() * Math.PI * 2,
      }));
      packets = [];
    };

    const resize = () => {
      ({ width, height } = fitCanvas(canvas, context));
      createNodes();
    };

    const spawnPacket = () => {
      if (!edges.length) return;
      const [a, b] = edges[Math.floor(Math.random() * edges.length)];
      const forward = Math.random() > 0.5;
      packets.push({ from: forward ? a : b, to: forward ? b : a, t: 0, speed: 0.7 + Math.random() * 0.9 });
    };

    const draw = (dt, now) => {
      context.clearRect(0, 0, width, height);
      const ink = colors.ink;
      const lineAlpha = colors.isLight ? 0.2 : 0.16;

      // Movimento dos nós (com leve repulsão do cursor)
      nodes.forEach((node) => {
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 110 * 110 && distSq > 1) {
            const force = (1 - Math.sqrt(distSq) / 110) * 40 * dt;
            node.x += (dx / Math.sqrt(distSq)) * force;
            node.y += (dy / Math.sqrt(distSq)) * force;
          }
        }
        node.x += node.vx * dt;
        node.y += node.vy * dt;
        if (node.x < -20) node.x = width + 20;
        else if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        else if (node.y > height + 20) node.y = -20;
      });

      // Arestas por proximidade
      edges = [];
      context.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > LINK_DISTANCE * LINK_DISTANCE) continue;
          const alpha = (1 - Math.sqrt(distSq) / LINK_DISTANCE) * lineAlpha;
          context.strokeStyle = `rgba(${ink}, ${alpha.toFixed(3)})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
          edges.push([a, b]);
        }
      }

      // Cursor como nó: conexões na cor de destaque
      if (mouse.active) {
        nodes.forEach((node) => {
          const distance = Math.hypot(node.x - mouse.x, node.y - mouse.y);
          if (distance > MOUSE_DISTANCE) return;
          const alpha = (1 - distance / MOUSE_DISTANCE) * 0.55;
          context.strokeStyle = `rgba(${colors.accent}, ${alpha.toFixed(3)})`;
          context.beginPath();
          context.moveTo(mouse.x, mouse.y);
          context.lineTo(node.x, node.y);
          context.stroke();
        });
      }

      // Nós (hubs pulsam)
      nodes.forEach((node) => {
        context.fillStyle = `rgba(${ink}, ${node.hub ? 0.75 : 0.4})`;
        context.beginPath();
        context.arc(node.x, node.y, node.hub ? node.r + 1.2 : node.r, 0, Math.PI * 2);
        context.fill();
        if (node.hub) {
          const pulse = (Math.sin(now / 700 + node.phase) + 1) / 2;
          context.strokeStyle = `rgba(${colors.accent}, ${(0.35 * (1 - pulse)).toFixed(3)})`;
          context.beginPath();
          context.arc(node.x, node.y, 4 + pulse * 12, 0, Math.PI * 2);
          context.stroke();
        }
      });

      // Pacotes trafegando pelas arestas
      spawnDebt += dt * PACKET_RATE;
      while (spawnDebt > 1) {
        spawnPacket();
        spawnDebt -= 1;
      }
      packets = packets.filter((packet) => {
        const length = Math.hypot(packet.to.x - packet.from.x, packet.to.y - packet.from.y);
        if (length > LINK_DISTANCE * 1.15) return false; // aresta "caiu"
        packet.t += (dt * packet.speed * 120) / Math.max(length, 20);
        if (packet.t >= 1) return false;
        const x = packet.from.x + (packet.to.x - packet.from.x) * packet.t;
        const y = packet.from.y + (packet.to.y - packet.from.y) * packet.t;
        const fade = Math.sin(packet.t * Math.PI);
        context.globalAlpha = fade;
        context.drawImage(glow, x - 12, y - 12, 24, 24);
        context.globalAlpha = 1;
        return true;
      });
    };

    readColors();
    resize();

    window.addEventListener("resize", GSA.utils.debounce(resize, 200));
    GSA.bus.on("theme:change", readColors);

    if (GSA.utils.prefersReducedMotion()) {
      draw(0, 0);
      return;
    }

    hero.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    });
    hero.addEventListener("pointerleave", () => {
      mouse.active = false;
    });

    GSA.utils.runWhenVisible(canvas, draw, { rootMargin: "0px" });
  }

  GSA.mesh = { init };
})(window, document);
