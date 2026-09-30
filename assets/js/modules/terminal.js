/**
 * Terminal interativo da seção "Sobre".
 * Ao entrar na tela, faz uma demonstração automática; depois o visitante
 * pode digitar comandos (help, whoami, stack, projetos, kubectl get pods...).
 *
 * Segurança: toda saída é montada com textContent/createElement — nunca
 * innerHTML com texto digitado pelo usuário.
 */
(function (window, document) {
  "use strict";

  const GSA = window.GSA;
  const { $ } = GSA.utils;

  const LINKS = {
    github: "https://github.com/guilhermesa-tech",
    linkedin: "https://linkedin.com/in/guilhermesantosdearaujo",
    email: "mailto:guilherme.satech@gmail.com",
  };

  const STACK = [
    ["Cloud & IaC", "AWS · Terraform · Ansible"],
    ["Containers", "Docker · Kubernetes"],
    ["CI/CD", "GitHub Actions · Git"],
    ["Observabilidade", "Prometheus · Grafana · Zabbix"],
    ["Sistemas & Redes", "Linux · Nginx · MikroTik"],
    ["Scripting", "Bash · Python"],
  ];

  const PODS = ["docker", "kubernetes", "terraform", "ansible", "aws", "github-actions", "prometheus", "grafana", "zabbix", "nginx"];

  const sessionStart = Date.now();

  /**
   * Cada linha de saída é uma lista de segmentos:
   * string simples | { text, cls } | { text, href }
   */
  const COMMANDS = {
    help: {
      description: "lista os comandos disponíveis",
      run: () => [
        [{ text: "Comandos disponíveis:", cls: "term-strong" }],
        ...Object.entries(COMMANDS)
          .filter(([, command]) => !command.hidden)
          .map(([name, command]) => [{ text: `  ${name.padEnd(17)}`, cls: "term-ok" }, { text: command.description, cls: "term-muted" }]),
        [{ text: "Dica: use ↑ ↓ para o histórico e Tab para completar.", cls: "term-muted" }],
      ],
    },
    whoami: {
      description: "quem é o Guilherme",
      run: () => [[{ text: "guilherme", cls: "term-strong" }, " — DevOps & SRE Engineer"]],
    },
    sobre: {
      description: "resumo profissional",
      run: () => [
        ["Guilherme Santos de Araújo, DevOps & SRE Engineer em Juara (MT)."],
        ["Construo infraestrutura confiável, pipelines de entrega automatizados"],
        ["e sistemas observáveis para produtos que não podem parar."],
        [{ text: "status: ", cls: "term-muted" }, { text: "disponível para DevOps / Cloud Júnior", cls: "term-ok" }],
      ],
    },
    stack: {
      description: "ferramentas do dia a dia",
      run: () => STACK.map(([group, tools]) => [{ text: `${group.padEnd(18)}`, cls: "term-accent" }, tools]),
    },
    projetos: {
      description: "projetos em destaque",
      run: () => [
        [{ text: "001 ", cls: "term-accent" }, "Pipeline de CI/CD e Validação Containerizada"],
        ["    ", { text: "github.com/guilhermesa-tech/React-CI-CD-vercel", href: "https://github.com/guilhermesa-tech/React-CI-CD-vercel" }],
        [{ text: "002 ", cls: "term-accent" }, "Dashboard de Observabilidade NOC ", { text: "(em breve)", cls: "term-warn" }],
        [{ text: "003 ", cls: "term-accent" }, "Infraestrutura como Código na AWS"],
        ["    ", { text: "github.com/guilhermesa-tech/terraform-aws-infrastructure", href: "https://github.com/guilhermesa-tech/terraform-aws-infrastructure" }],
      ],
    },
    contato: {
      description: "como falar com ele",
      run: () => [
        [{ text: "email     ", cls: "term-muted" }, { text: "guilherme.satech@gmail.com", href: LINKS.email }],
        [{ text: "linkedin  ", cls: "term-muted" }, { text: "in/guilhermesantosdearaujo", href: LINKS.linkedin }],
        [{ text: "github    ", cls: "term-muted" }, { text: "guilhermesa-tech", href: LINKS.github }],
        [{ text: "telefone  ", cls: "term-muted" }, { text: "+55 66 99622-1648", href: "tel:+5566996221648" }],
        [{ text: "Resposta em até 24 horas.", cls: "term-ok" }],
      ],
    },
    local: {
      description: "onde ele está",
      run: () => [["Juara, Mato Grosso, Brasil"], [{ text: "11°15′18″S 57°31′12″W · UTC−4", cls: "term-muted" }]],
    },
    idiomas: {
      description: "idiomas",
      run: () => [
        [{ text: "pt-BR  ", cls: "term-accent" }, "Português — nativo"],
        [{ text: "en     ", cls: "term-accent" }, "Inglês — técnico (documentação)"],
      ],
    },
    "kubectl get pods": {
      description: "a stack rodando em produção",
      run: () => [
        // Tabela enxuta (cabe em telas de celular sem quebrar linha)
        [{ text: "NAME                  READY  STATUS", cls: "term-muted" }],
        ...PODS.map((pod) => {
          const suffix = Math.random().toString(36).slice(2, 7);
          return [`${`${pod}-${suffix}`.padEnd(22)}1/1    `, { text: "Running", cls: "term-ok" }];
        }),
      ],
    },
    "terraform plan": {
      description: "confere a infraestrutura",
      run: () => [
        [{ text: "No changes.", cls: "term-ok" }, " Your infrastructure matches the configuration."],
        [{ text: "(e este portfólio também está versionado ;)", cls: "term-muted" }],
      ],
    },
    uptime: {
      description: "tempo desta sessão",
      run: () => {
        const seconds = Math.floor((Date.now() - sessionStart) / 1000);
        const minutes = Math.floor(seconds / 60);
        return [[`up ${minutes}m ${String(seconds % 60).padStart(2, "0")}s, 1 visitante, load average: 0.00 — tudo verde`]];
      },
    },
    github: { description: "abre o GitHub", run: () => openLink(LINKS.github, "GitHub") },
    linkedin: { description: "abre o LinkedIn", run: () => openLink(LINKS.linkedin, "LinkedIn") },
    email: { description: "escreve um e-mail", run: () => openLink(LINKS.email, "seu app de e-mail") },
    clear: { description: "limpa a tela", run: () => "clear" },

    // Comandos "escondidos" (não aparecem no help)
    ls: { hidden: true, run: () => [["sobre.txt  stack.yml  projetos/  contato.md  curriculo.pdf?  (digite help)"]] },
    date: { hidden: true, run: () => [[new Date().toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })]] },
    ping: { hidden: true, run: () => [["PONG — latência baixa, resposta em até 24h."]] },
    exit: { hidden: true, run: () => [[{ text: "Não dá pra sair: você está em produção.", cls: "term-warn" }]] },
    history: { hidden: true, run: (args, ctx) => ctx.history.map((entry, index) => [`  ${String(index + 1).padStart(3)}  ${entry}`]) },
  };

  const COMMAND_NAMES = Object.keys(COMMANDS);

  /** Abre o link e devolve também um link clicável (caso o pop-up seja bloqueado). */
  function openLink(href, label) {
    if (href.startsWith("http")) window.open(href, "_blank", "noopener,noreferrer");
    else window.location.href = href;
    return [[{ text: `Abrindo ${label}... `, cls: "term-ok" }, { text: "(ou clique aqui)", href }]];
  }

  function renderSegments(line, segments) {
    segments.forEach((segment) => {
      if (typeof segment === "string") {
        line.appendChild(document.createTextNode(segment));
      } else if (segment.href) {
        const link = document.createElement("a");
        link.href = segment.href;
        link.textContent = segment.text;
        if (segment.href.startsWith("http")) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        line.appendChild(link);
      } else {
        const span = document.createElement("span");
        span.className = segment.cls || "";
        span.textContent = segment.text;
        line.appendChild(span);
      }
    });
  }

  function init() {
    const root = $("[data-terminal]");
    if (!root) return;

    const body = $("[data-terminal-body]", root);
    const output = $("[data-terminal-output]", root);
    const form = $("[data-terminal-form]", root);
    const input = $("#terminal-input", root);

    const history = [];
    let historyIndex = 0;
    let demoRunning = false;
    let demoCancelled = false;

    const scrollToEnd = () => {
      body.scrollTop = body.scrollHeight;
    };

    const print = (segments, extraClass = "") => {
      const line = document.createElement("div");
      line.className = `term-line ${extraClass}`.trim();
      renderSegments(line, segments);
      output.appendChild(line);
      scrollToEnd();
    };

    const printCommand = (text) =>
      print([{ text: "guilherme@infra:~$ ", cls: "term-prompt" }, { text, cls: "term-strong" }], "term-line--cmd");

    const execute = (raw) => {
      const text = raw.trim().replace(/\s+/g, " ");
      printCommand(text);
      if (!text) return;

      history.push(text);
      historyIndex = history.length;

      const lower = text.toLowerCase();
      if (lower.startsWith("sudo")) {
        print([{ text: "guilherme não está no arquivo sudoers. Este incidente será reportado. ;)", cls: "term-warn" }]);
        return;
      }
      if (/^rm\s+-rf/.test(lower)) {
        print([{ text: "Negado. Esta infraestrutura tem backup, RBAC e um SRE de plantão.", cls: "term-err" }]);
        return;
      }
      if (lower.startsWith("echo ")) {
        print([text.slice(5)]);
        return;
      }

      const command = COMMANDS[lower];
      if (!command) {
        print([{ text: `comando não encontrado: ${text}`, cls: "term-err" }, { text: '  (digite "help")', cls: "term-muted" }]);
        return;
      }
      const result = command.run([], { history });
      if (result === "clear") {
        output.textContent = "";
        return;
      }
      result.forEach((segments) => print(segments));
    };

    // Demonstração automática ao aparecer na tela
    const typeInto = async (text) => {
      for (const character of text) {
        if (demoCancelled) return;
        input.value += character;
        await new Promise((resolve) => window.setTimeout(resolve, 55 + Math.random() * 60));
      }
    };

    const runDemo = async () => {
      if (GSA.utils.prefersReducedMotion()) {
        execute("whoami");
        execute("sobre");
        print([{ text: 'Digite "help" para ver todos os comandos.', cls: "term-muted" }]);
        return;
      }
      demoRunning = true;
      print([{ text: "Last login: agora, via guilhermesantosdearaujo.vercel.app", cls: "term-muted" }]);
      for (const command of ["whoami", "sobre", "kubectl get pods"]) {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        await typeInto(command);
        if (demoCancelled) break;
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        input.value = "";
        execute(command);
      }
      demoRunning = false;
      if (!demoCancelled) print([{ text: 'Sua vez: digite "help" e pressione Enter.', cls: "term-ok" }]);
    };

    const cancelDemo = () => {
      if (!demoRunning) return;
      demoCancelled = true;
      demoRunning = false;
      input.value = "";
    };

    GSA.utils.observe([root], () => runDemo(), { threshold: 0.45 });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      cancelDemo();
      execute(input.value);
      input.value = "";
    });

    input.addEventListener("keydown", (event) => {
      if (demoRunning && event.key.length === 1) cancelDemo();

      if (event.key === "ArrowUp" && history.length) {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex];
      } else if (event.key === "ArrowDown" && history.length) {
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = history[historyIndex] || "";
      } else if (event.key === "Tab") {
        const value = input.value.toLowerCase();
        if (!value) return;
        const match = COMMAND_NAMES.find((name) => name.startsWith(value) && !COMMANDS[name].hidden);
        if (match) {
          event.preventDefault();
          input.value = match;
        }
      } else if (event.key === "l" && event.ctrlKey) {
        event.preventDefault();
        output.textContent = "";
      }
    });

    input.addEventListener("focus", cancelDemo);

    // Clicar no corpo foca o input (sem roubar cliques em links ou seleção de texto)
    body.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) return;
      if (window.getSelection && String(window.getSelection())) return;
      input.focus({ preventScroll: true });
    });
  }

  GSA.terminal = { init };
})(window, document);
