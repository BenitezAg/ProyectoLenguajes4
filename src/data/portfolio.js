export const teamInfo = {
  name: "Colectivo Dev 4",
  tagline: "Equipo de cuatro integrantes · Lenguajes IV",
  description:
    "Equipo de cuatro integrantes que desarrolla el Trabajo Práctico Integrador de Lenguajes IV.",
};

export const teamMembers = [
  {
    id: "santiago-daniel-acuna",
    name: "Santiago Daniel Acuña",
    role: "Integrante del equipo",
    avatar: "SA",
    color: "pink",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [],
  },
  {
    id: "angel-gabriel-benitez",
    name: "Angel Gabriel Benitez",
    role: "Integrante del equipo",
    avatar: "AB",
    photo: "./imagenes/fotos%20de%20integrantes/BenitezAngelGabriel.jpeg",
    color: "yellow",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [],
  },
  {
    id: "abel-villafane",
    name: "Abel Villafañe",
    role: "Integrante del equipo",
    avatar: "AV",
    color: "cyan",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [],
  },
  {
    id: "wilson-lopez",
    name: "Wilson Lopez",
    role: "Integrante del equipo",
    avatar: "WL",
    color: "green",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [],
  },
];

export const owner = {
  name: teamInfo.name,
  membersCount: teamMembers.length,
};

export const initialPortfolio = {
  projects: [],
  demos: [],
  services: [],
  users: [],
  messages: [],
  analytics: { visits: 0, registeredVisits: 0, dailyVisits: [] },
};

export const skillGroups = [
  {
    title: "Frontend & UX/UI",
    description: "Herramientas utilizadas en el desarrollo del portfolio.",
    icon: "✧",
    skills: [
      "React 19 & JavaScript (ESNext)",
      "Bootstrap 5 & CSS",
      "Web APIs",
    ],
  },
  {
    title: "Backend & Servidor",
    description: "Servicios de datos y autenticación configurados en el proyecto.",
    icon: "⌘",
    skills: [
      "Supabase",
      "PostgreSQL",
      "Row Level Security (RLS)",
    ],
  },
  {
    title: "DevOps, Cloud & QA",
    description: "Herramientas de colaboración, pruebas y publicación incluidas.",
    icon: "◈",
    skills: [
      "Node:test",
      "GitHub Actions & GitHub Pages",
      "Git",
    ],
  },
];

export const timeline = [
  {
    period: "Trabajo Práctico Integrador",
    role: "Equipo de Lenguajes IV",
    detail:
      "Desarrollo colaborativo del portfolio full stack de 4 integrantes con React 19, Supabase RLS y Bootstrap 5.",
  },
];
