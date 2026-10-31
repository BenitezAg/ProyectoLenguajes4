export const teamInfo = {
  name: "Colectivo Dev 4",
  tagline: "Equipo de 4 Desarrolladores Full Stack",
  email: "equipo4@portfolio.dev",
  description:
    "Equipo integrado por 4 desarrolladores especializados en arquitectura web moderna, bases de datos PostgreSQL, APIs REST y experiencias visuales fluidas.",
};

export const teamMembers = [
  {
    id: "angel-benitez",
    name: "Ángel Benítez",
    role: "Full Stack Lead & Cloud Architect",
    specialty: "Arquitectura, Supabase/SQL, CI/CD, React 19",
    avatar: "AB",
    color: "pink",
    bio: "Lidera la integración del stack tecnológico, diseño de esquemas en PostgreSQL con RLS y automatización de despliegues.",
    skills: ["React 19", "Supabase", "PostgreSQL", "Docker", "CI/CD"],
    github: "https://github.com/BenitezAg",
    linkedin: "https://linkedin.com",
    email: "angel@portfolio.dev",
  },
  {
    id: "Santiago Daniel Acuña",
    name: "Santiago Daniel Acuña",
    role: "Frontend Engineer & UI/UX Specialist",
    specialty: "Interfaces adaptativas, Animaciones, Bootstrap 5, Accesibilidad",
    avatar: "SR",
    color: "yellow",
    bio: "Diseña experiencias visuales cautivadoras, garantizando diseño responsive, microinteracciones fluidas y accesibilidad web.",
    skills: ["React 19", "CSS3 / Animaciones", "Bootstrap 5", "Figma", "Web APIs"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "sofia@portfolio.dev",
  },
  {
    id: "lucas-maidana",
    name: "Lucas Maidana",
    role: "Backend & Database Developer",
    specialty: "APIs REST, Lógica de Servidor, Optimización SQL, Node.js",
    avatar: "LM",
    color: "cyan",
    bio: "Especialista en desarrollo del lado del servidor, diseño de endpoints estructurados y validaciones estrictas de datos.",
    skills: ["Node.js", "Express", "PostgreSQL", "REST APIs", "Testing"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "lucas@portfolio.dev",
  },
  {
    id: "valentina-torres",
    name: "Valentina Torres",
    role: "Fullstack & QA / Security Engineer",
    specialty: "Row Level Security, Testing, Autenticación, Integración Web APIs",
    avatar: "VT",
    color: "green",
    bio: "Garantiza la seguridad en autenticación, pruebas unitarias automatizadas y la integración de APIs Web nativas.",
    skills: ["Supabase Auth", "Row Level Security", "Unit Testing", "Web APIs", "JavaScript"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "valentina@portfolio.dev",
  },
];

export const owner = {
  name: teamInfo.name,
  email: teamInfo.email,
  membersCount: teamMembers.length,
};

export const initialPortfolio = {
  projects: [
    {
      id: "tienda-online",
      title: "Tienda online",
      category: "web",
      emoji: "🛍️",
      color: "pink",
      description:
        "Una tienda online veloz, con carrito interactivo, procesamiento seguro y arquitectura de microservicios.",
      technologies: "React 19 · Node.js · Supabase · Bootstrap 5",
      members: ["Ángel Benítez", "Sofía Romero"],
    },
    {
      id: "identidad-de-marca",
      title: "Identidad de marca",
      category: "diseno",
      emoji: "🎨",
      color: "yellow",
      description:
        "Sistema visual y prototipado UX/UI completo con manual de marca y especificación de diseño responsive.",
      technologies: "Figma · UI/UX · CSS Variables · Design System",
      members: ["Sofía Romero"],
    },
    {
      id: "app-de-habitos",
      title: "App de hábitos",
      category: "app",
      emoji: "📱",
      color: "cyan",
      description:
        "Aplicación web progresiva con sincronización de estado, almacenamiento relacional y metas diarias.",
      technologies: "React · PostgreSQL · Web Storage API",
      members: ["Lucas Maidana", "Valentina Torres"],
    },
    {
      id: "dashboard-analitico",
      title: "Dashboard analítico",
      category: "web",
      emoji: "📊",
      color: "green",
      description:
        "Panel interactivo con métricas en tiempo real, gráficos visuales de tráfico y consultas parametrizadas.",
      technologies: "React · Canvas/SVG · PostgreSQL RLS",
      members: ["Ángel Benítez", "Lucas Maidana"],
    },
    {
      id: "ilustracion-editorial",
      title: "Ilustración editorial",
      category: "diseno",
      emoji: "🖌️",
      color: "purple",
      description:
        "Galería interactiva con animaciones de transición, soporte multimedia y navegación táctil.",
      technologies: "CSS Animations · Web APIs · Vector Graphics",
      members: ["Sofía Romero", "Valentina Torres"],
    },
    {
      id: "juego-arcade",
      title: "Juego arcade",
      category: "app",
      emoji: "🎮",
      color: "blue",
      description:
        "Juego de reflejos de alto rendimiento desarrollado con Canvas 2D, Web Audio API y registro de puntajes.",
      technologies: "JavaScript · Canvas 2D · Web Audio API",
      members: ["Ángel Benítez", "Valentina Torres"],
    },
  ],
  demos: [
    {
      id: "demo-tienda",
      projectId: "tienda-online",
      name: "Compra interactiva",
      description: "Añade un producto al carrito interactivo y simula el flujo de compra.",
      kind: "shop",
    },
    {
      id: "demo-marca",
      projectId: "identidad-de-marca",
      name: "Explorador de identidad",
      description: "Explora la paleta cromática, tipografías y componentes visuales.",
      kind: "brand",
    },
    {
      id: "demo-habitos",
      projectId: "app-de-habitos",
      name: "Seguimiento de hábitos",
      description: "Marca tu progreso diario en esta demo interactiva con persistencia.",
      kind: "habits",
    },
    {
      id: "demo-dashboard",
      projectId: "dashboard-analitico",
      name: "Panel de estadísticas",
      description: "Consulta métricas parametrizadas con gráficos visuales interactivos.",
      kind: "dashboard",
    },
    {
      id: "demo-ilustracion",
      projectId: "ilustracion-editorial",
      name: "Muestra editorial",
      description: "Explora la galería interactiva con animaciones CSS fluidas.",
      kind: "gallery",
    },
    {
      id: "demo-arcade",
      projectId: "juego-arcade",
      name: "Reto de reflejos",
      description: "Demostración lúdica con Canvas y sonido interactivo en tiempo real.",
      kind: "arcade",
    },
  ],
  services: [
    {
      id: "desarrollo-fullstack",
      icon: "⌘",
      title: "Desarrollo full stack",
      description:
        "Aplicaciones web completas, rápidas y adaptadas al crecimiento de tu proyecto, de la BD al frontend.",
    },
    {
      id: "diseno-ux",
      icon: "✳",
      title: "Diseño y experiencia UX/UI",
      description:
        "Interfaces intuitivas, responsivas y accesibles con prototipado riguroso y manuales de estilo.",
    },
    {
      id: "asesoria",
      icon: "↗",
      title: "Asesoría y arquitectura cloud",
      description:
        "Acompañamiento técnico, optimización de base de datos con RLS, auditorías de seguridad y CI/CD.",
    },
  ],
  users: [],
  messages: [],
  analytics: { visits: 0, registeredVisits: 0, dailyVisits: [] },
};

export const skillGroups = [
  {
    title: "Frontend & UX/UI",
    description: "Interfaces reactivas, accesibles y con animaciones de alto rendimiento.",
    icon: "✧",
    skills: [
      { name: "React 19 & JavaScript (ESNext)", value: 96 },
      { name: "Bootstrap 5 & CSS Moderno", value: 95 },
      { name: "Web APIs & Microinteracciones", value: 90 },
      { name: "Prototipado UX/UI en Figma", value: 88 },
    ],
  },
  {
    title: "Backend & Servidor",
    description: "Arquitecturas escalables, endpoints RESTful y control estricto de accesos.",
    icon: "⌘",
    skills: [
      { name: "Node.js & Express", value: 92 },
      { name: "PostgreSQL & Supabase", value: 94 },
      { name: "Row Level Security (RLS)", value: 90 },
      { name: "Validación estricta & Sanitización", value: 93 },
    ],
  },
  {
    title: "DevOps, Cloud & QA",
    description: "Flujos de integración continua, pruebas automáticas y despliegue continuo.",
    icon: "◈",
    skills: [
      { name: "Testing con Node:test & TDD", value: 89 },
      { name: "GitHub Actions & GitHub Pages", value: 92 },
      { name: "Git, Branching & Colaboración", value: 95 },
      { name: "Docker & Servidores Cloud", value: 82 },
    ],
  },
];

export const timeline = [
  {
    period: "2024 — Presente",
    role: "Equipo de Desarrollo Integrador · Lenguajes IV",
    detail:
      "Desarrollo colaborativo del portfolio full stack de 4 integrantes con React 19, Supabase RLS y Bootstrap 5.",
  },
  {
    period: "2023 — 2024",
    role: "Proyectos Web & Soluciones Digitales",
    detail:
      "Construcción de aplicaciones full stack, APIs RESTful, sistemas de gestión y paneles administrativos.",
  },
  {
    period: "2022 — 2023",
    role: "Formación Universitaria en Tecnologías Web",
    detail:
      "Estudio de arquitecturas distribuidas, bases de datos relacionales, seguridad informática y metodologías ágiles.",
  },
];
