# 🎁 Portfólio — Guilherme Santos de Araújo

> DevOps & SRE Engineer · Juara, Mato Grosso · Brasil

Portfólio pessoal do Guilherme, feito à mão em **HTML, CSS e JavaScript puros**: sem framework, sem build, sem dependências. É só abrir o `index.html` e pronto. A ideia do visual é tratar o portfólio como um sistema em produção: ele "faz deploy" ao abrir, tem pipeline, terminal, dashboard de observabilidade e um globo ligando Juara às regiões da AWS. 🚀

---

## ✨ O que tem no site

| Seção | O que acontece |
| --- | --- |
| 🟢 **Abertura** | Um "deploy" com log de boot (`[ OK ] terraform apply…`), contador 000→100 e cortinas que se abrem. Completa só na 1ª visita da sessão; clique ou `Esc` pula. |
| 👋 **Hero** | Nome gigante em fonte variável que **engorda e alarga** perto do cursor, foto com moldura cônica girando, tilt 3D com reflexo holográfico, chips de ferramentas orbitando e uma malha de rede viva com pacotes trafegando ao fundo. |
| 🎞️ **Marquee** | Duas faixas cruzadas com as áreas de atuação. Aceleram e invertem de direção conforme o scroll. |
| 🧑‍💻 **Sobre** | Manifesto que acende palavra por palavra no scroll + **terminal interativo** (digite `help`!) + números animados. |
| ⚙️ **Atuação** | As áreas viram um **workflow de CI/CD**: rolando a página, cada estágio passa de `queued` → `running` → `success`. No desktop a seção fica "pinada". |
| 📦 **Projetos** | Cards que se empilham no scroll, cada um com uma demo viva: run do GitHub Actions, dashboard NOC com 29 hosts e alertas, e `terraform apply` sincronizado com o diagrama da AWS. |
| 🧰 **Stack** | 15 ferramentas com ícones oficiais, filtro por categoria e brilho na cor de cada marca. |
| 🌎 **Contato** | Globo de pontos com os continentes reais, Juara pulsando e arcos até as regiões da AWS (dá pra arrastar!). E-mail com botão de copiar e formulário que abre o app de e-mail com a mensagem pronta. |
| 🌗 **Tema** | Claro/escuro com transição circular a partir do botão (salvo no navegador). |

### 🥚 Comandos do terminal

`help` · `whoami` · `sobre` · `stack` · `projetos` · `contato` · `local` · `idiomas` · `kubectl get pods` · `terraform plan` · `uptime` · `github` · `linkedin` · `email` · `clear`

Tem também alguns escondidos (tenta um `sudo` 😏). Setas ↑ ↓ navegam no histórico e `Tab` completa.

---

## 🚀 Como abrir

**Jeito mais simples:** dê dois cliques no `index.html`. Funciona direto do disco (precisa de internet só para as fontes do Google Fonts).

**Com servidor local** (mais fiel ao site publicado), no terminal, dentro da pasta do projeto:

```bash
python -m http.server 5500
```

Depois acesse `http://localhost:5500`.

---

## 🖼️ Trocar a foto

A foto fica em `assets/img/` em três tamanhos WebP + um JPG de fallback (recorte **4:5**, retrato):

| Arquivo | Uso |
| --- | --- |
| `guilherme-480.webp` | celulares |
| `guilherme-800.webp` | telas comuns |
| `guilherme-1080.webp` | telas retina |
| `guilherme-800.jpg` | navegadores sem WebP + dados estruturados (SEO) |

Para trocar: gere os 4 arquivos com os **mesmos nomes** e substitua. Se a foto não carregar por algum motivo, o site mostra um monograma "GSA" no lugar (nada quebra).

A imagem de compartilhamento (`og-image.jpg`, 1200×630) é o que aparece quando o link é enviado no WhatsApp/LinkedIn.

---

## ✏️ Editar conteúdo

| Quero mudar… | Onde |
| --- | --- |
| Textos, projetos, links, stack | `index.html` |
| Frases que o hero digita | `ROLES` em `assets/js/modules/hero.js` |
| Comandos do terminal | `COMMANDS` em `assets/js/modules/terminal.js` |
| Log da abertura | `LOG` em `assets/js/modules/preloader.js` |
| Cores, fontes, espaçamentos | `assets/css/tokens.css` (design tokens) |
| Regiões do globo | `REGIONS` em `assets/js/modules/globe.js` |

---

## 📁 Estrutura

```
├── index.html               # conteúdo + sprite de ícones inline
├── favicon.ico
├── vercel.json              # headers de segurança (só vale quando publicado na Vercel)
└── assets/
    ├── css/
    │   ├── tokens.css       # design system: cores, tipo, espaço, movimento
    │   ├── base.css         # reset, tipografia, acessibilidade
    │   ├── components.css   # botões, chips, janelas, tags, toast
    │   ├── effects.css      # abertura, cursor, grão, revelações
    │   └── sections/        # um arquivo por seção
    ├── js/
    │   ├── theme-init.js    # aplica o tema antes do 1º paint
    │   ├── main.js          # inicializa tudo (cada módulo isolado)
    │   ├── data/land.js     # máscara dos continentes do globo (~2 KB)
    │   └── modules/         # um módulo por responsabilidade
    └── img/                 # foto, favicon, og-image
```

Os scripts são clássicos (com `defer`) registrando módulos em `window.GSA`, em vez de ES modules. Motivo: ES modules são bloqueados pelo navegador quando o arquivo é aberto direto do disco (`file://`).

---

## ♿ Acessibilidade e ⚡ performance

- Respeita **"reduzir movimento"** do sistema: sem abertura, sem pin, sem cursor customizado e tudo visível de cara.
- Navegação completa por teclado, link "pular para o conteúdo", foco visível, `aria-live` no terminal e no filtro.
- Cursor customizado só aparece com mouse. No celular fica o toque normal.
- Canvases e demos **pausam fora da tela** e com a aba em segundo plano. Um único `requestAnimationFrame` alimenta tudo.
- Foto de 2 MB otimizada para 18–72 KB (WebP responsivo) e sem bibliotecas externas de JS.
- SEO: meta tags, Open Graph, dados estruturados (`schema.org/Person`) e `lang="pt-BR"`.

---

## ☁️ Publicar (quando for a hora)

O site é estático, então funciona em qualquer hospedagem. Na Vercel, basta importar a pasta/repositório sem configurar nada: o `vercel.json` já adiciona headers de segurança (CSP, `nosniff`, anti-iframe etc.).

> Se o endereço final for diferente de `guilhermesantosdearaujo.vercel.app`, atualize as URLs absolutas no `<head>` do `index.html` (`canonical`, `og:url`, `og:image` e o JSON-LD).

---

## 📜 Créditos

| Recurso | Licença |
| --- | --- |
| Ícones das marcas: [Simple Icons](https://simpleicons.org) | CC0 |
| Ícones de interface: [Lucide](https://lucide.dev) | ISC |
| Continentes do globo: [Natural Earth](https://www.naturalearthdata.com) | Domínio público |
| Fontes: Archivo e JetBrains Mono ([Google Fonts](https://fonts.google.com)) | OFL |

O ícone do Zabbix é um glifo próprio, pois a marca não está no Simple Icons.
