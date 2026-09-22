// ============================================================
//  portfolio.ts — Fonte única de dados (Português)
// ============================================================

export const personal = {
  name: 'Guilherme Santos de Araújo',
  initials: 'GSA',
  role: 'Engenheiro DevOps Júnior',
  tagline: 'DEVOPS, CLOUD &\nAUTOMATION',
  bio: 'Construindo infraestrutura confiável, pipelines de entrega automatizados e sistemas observáveis para produtos que não podem parar.',
  location: 'Juara, Mato Grosso — Brasil',
  email: 'guilherme.satech@gmail.com',
  phone: '+55 66 99622-1648',
  github: 'https://github.com/guilhermesa-tech',
  linkedin: 'https://linkedin.com/in/guilhermesantosdearaujo',
  cv: '#',
} as const;

// ── Áreas de atuação (ticker) ─────────────────────────────

export const areas = [
  'Cloud Infrastructure',
  'CI/CD',
  'Observabilidade',
  'IaC',
  'Incident Response',
  'Automação de Segurança',
  'Platform Engineering',
  'SRE',
  'Docker & Kubernetes',
  'Terraform',
];

// ── Cases / Projetos ──────────────────────────────────────

export interface Case {
  number: string;
  title: string;
  description: string;
  tags: string[];
  repo: string | null;
}

export const cases: Case[] = [
  {
    number: '001',
    title: 'Pipeline de CI/CD e Validação Containerizada',
    description: 'Pipeline de integração contínua para validação de código (lint, testes, auditoria de segurança) e validação de container Docker via smoke test automatizado.',
    tags: ['GitHub Actions', 'Docker', 'Vercel', 'CI/CD'],
    repo: 'https://github.com/guilhermesa-tech/React-CI-CD-vercel',
  },
  {
    number: '002',
    title: 'Dashboard de Observabilidade NOC',
    description: 'Stack de monitoramento centralizado para 29 clientes corporativos com alertas proativos, métricas de performance e SLOs mensuráveis.',
    tags: ['Grafana', 'Prometheus', 'Zabbix', 'SNMP'],
    repo: null,
  },
  {
    number: '003',
    title: 'Infraestrutura como Código na AWS',
    description: 'Provisionamento reproduzível de VPC, EC2, S3 e Security Groups com Terraform + Ansible para configuração idempotente dos servidores.',
    tags: ['Terraform', 'Ansible', 'AWS', 'IaC'],
    repo: null,
  },
];

// ── Stack ─────────────────────────────────────────────────

export interface TechItem {
  name: string;
  accent?: boolean;
}

export const stack: TechItem[] = [
  { name: 'Docker', accent: true },
  { name: 'Kubernetes' },
  { name: 'Linux', accent: true },
  { name: 'GitHub Actions', accent: true },
  { name: 'Terraform' },
  { name: 'Ansible' },
  { name: 'AWS', accent: true },
  { name: 'Prometheus' },
  { name: 'Grafana', accent: true },
  { name: 'Zabbix' },
  { name: 'Bash' },
  { name: 'Python' },
  { name: 'MikroTik' },
  { name: 'Git' },
  { name: 'Nginx' },
];

// ── Experiência ───────────────────────────────────────────

export const experiences = [
  {
    id: 'satt-noc',
    role: 'Analista de NOC Júnior',
    company: 'Satt Tecnologia Mato Grosso',
    period: 'Out 2024 — Presente',
    location: 'Mato Grosso, Brasil',
    current: true,
    bullets: [
      'Disponibilidade e segurança de redes para 29 clientes corporativos.',
      'Stack de monitoramento com Zabbix, SNMP, Wireshark e MTR para detecção proativa de falhas.',
      'Firewall, NAT e ACLs para mitigação de ameaças externas.',
      'Segmentação de redes (VLANs) com padronização de políticas de segurança.',
      'Desenvolvimento de runbooks que reduziram chamados escalados para N2.',
    ],
  },
];

export const certifications = [
  { name: 'Zabbix', issuer: 'Redes Brasil', period: 'Out 2025 — em andamento' },
  { name: 'MikroTik RouterOS v7', issuer: 'Redes Brasil', period: 'Out–Dez 2025' },
  { name: 'Networking Basics', issuer: 'Cisco Networking Academy', period: 'Dez 2025 – Jan 2026' },
  { name: 'Workshop DevOps na Nuvem (Agentes de IA)', issuer: 'Jan/2026 e Mai/2026', period: '2026' },
];
