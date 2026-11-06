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
    avatar: "SA",
    photo: "./imagenes/fotos%20de%20integrantes/Chanti.jpeg",
    color: "white",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [],
    // Nuevos campos para el pop-up
    education: "Estudiante de Ingenieria en Informatica",
    location: "Salta, Argentina",
    fullPhoto: "./imagenes/fotos%20de%20integrantes/Santi.jpeg", 
    detailedSkills: [
      { name: "HTML / CSS", percentage: 95 },
      { name: "JavaScript", percentage: 85 },
      { name: "React", percentage: 80 }
    ]
  },
  {
    id: "angel-gabriel-benitez",
    name: "Angel Gabriel Benitez",
    avatar: "AB",
    photo: "./imagenes/fotos%20de%20integrantes/Angel.jpeg",
    color: "yellow",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [],
    // Nuevos campos para el pop-up
    education: "Estudiante de Ingenieria en Informatica",
    location: "Salta, Argentina",
    fullPhoto: "./imagenes/fotos%20de%20integrantes/BenitezAngelGabriel.jpeg", // Reutilizamos su foto para el pop-up
    detailedSkills: [
      { name: "Java", percentage: 75 },
      { name: "SQL", percentage: 80 },
      { name: "Bases de Datos", percentage: 95 }
    ]
  },
  {
    id: "abel-villafane",
    name: "Abel Villafañe",
    avatar: "AV",
    photo: "./imagenes/fotos%20de%20integrantes/VillafañeAbel.jpg",
    color: "cyan",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [ { name: "Java", percentage: 90 },
      { name: "SQL", percentage: 80 },
      { name: "Bases de Datos", percentage: 60 }
    ],
    // Nuevos campos para el pop-up
    education: "Estudiante de Ingenieria en Informatica",
    location: "Salta, Argentina",
    fullPhoto: "./imagenes/fotos%20de%20integrantes/VillafañeAbel.jpg",
    detailedSkills: [
      { name: "Vite / Leaflet API", percentage: 80 },
      { name: "Lógica y Algoritmos", percentage: 60 },
      { name: "HTML / CSS", percentage: 90 }
    ]
  },
  {
    id: "wilson-lopez",
    name: "Wilson Lopez",
    avatar: "WL",
    photo: "./imagenes/fotos%20de%20integrantes/Wilson.jpeg",
    color: "green",
    bio: "Integrante del equipo de Lenguajes IV.",
    skills: [],
    // Nuevos campos para el pop-up
    education: "Estudiante de Ingenieria en Informatica",
    location: "Salta, Argentina",
    fullPhoto: "./imagenes/fotos%20de%20integrantes/Wilson.jpeg",
    detailedSkills: [
      { name: "React", percentage: 85 },
      { name: "JavaScript", percentage: 80 },
      { name: "Diseño UI/UX", percentage: 75 }
    ]
  },
];

export const owner = {
  name: teamInfo.name,
  membersCount: teamMembers.length,
};

export const initialPortfolio = {
  projects: [
    {
      id: "Pagina Web de Productos de Computacion",
      category: "web",
      title: "ZonaHardware",
      description: "Plataforma web full-stack desarrollada para la venta de productos de computacion",
      tech: "React 19, Supabase, Bootstrap 5",
      // 👇 NUEVOS CAMPOS 👇
      url: "https://flitz.vercel.app", 
      image: "./imagenes/web/Zonahardware.png" // Guarda una captura de tu web en esta ruta
    },
    {
      id: "app-mapas",
      category: "app",
      title: "Geolocalización Interactiva",
      description: "Aplicación de mapas que utiliza la API de Leaflet para trazar ubicaciones en tiempo real.",
      tech: "Vite, Leaflet, JavaScript",
      // 👇 NUEVOS CAMPOS 👇
      url: "https://abelvillafane1173.github.io/TP2-Lenguajes-4/",
      image: "./imagenes/web/mapa.png" 
    },
    {
      id: "backend-api",
      category: "web",
      title: "API Rest y Gestión de Datos",
      description: "Diseño e implementación de lógica de servidor y operaciones CRUD estructuradas.",
      tech: "Java, SQL, PostgreSQL",
      // 👇 NUEVOS CAMPOS 👇
      url: "https://openbrewerydb.org",
      image: "./imagenes/web/api.png" 
    }
  ],
  demos: [],
  services: [
    {
      id: "frontend",
      icon: "💻",
      title: "Desarrollo Frontend",
      description: "Creación de interfaces de usuario dinámicas, accesibles y optimizadas para cualquier dispositivo utilizando React y CSS moderno."
    },
    {
      id: "backend-db",
      icon: "🗄️",
      title: "Backend & Bases de Datos",
      description: "Modelado de datos, creación de consultas complejas en SQL y configuración de reglas de seguridad (RLS) en servidores."
    },
    {
      id: "analisis",
      icon: "⚙️",
      title: "Análisis y Arquitectura",
      description: "Levantamiento de requerimientos, diseño de flujos de trabajo y aplicación de metodologías ágiles para asegurar la calidad del software."
    }
  ],
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