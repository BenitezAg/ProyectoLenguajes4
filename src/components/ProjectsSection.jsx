import { useMemo, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import ProjectCard from "./ProjectCard.jsx";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

const filters = [
  { value: "todos", label: "Todos" },
  { value: "web", label: "Web" },
  { value: "diseno", label: "Diseño" },
  { value: "app", label: "Apps" },
];

export default function ProjectsSection({ user, onLogin, onSelectProject }) {
  const { portfolio } = usePortfolio();
  const [filter, setFilter] = useState("todos");
  const filteredProjects = useMemo(
    () =>
      filter === "todos"
        ? portfolio.projects
        : portfolio.projects.filter((project) => project.category === filter),
    [filter, portfolio.projects],
  );

  function openProject(project) {
    if (!user) {
      onLogin();
      return;
    }
    onSelectProject(project);
  }

  return (
    <section id="proyectos" className="section-padding projects-section">
      <div className="container">
        <SectionHeading
          eyebrow="Trabajo del equipo"
          title="Proyectos."
          description={
            portfolio.projects.length === 0
              ? "Los proyectos del equipo se publicarán aquí cuando estén listos."
              : user
                ? "Selecciona un proyecto para consultar sus detalles y demos interactivas."
                : "Crea una cuenta para descubrir los proyectos publicados y probar sus demos."
          }
        />
        {portfolio.projects.length > 0 && (
          <Reveal className="project-filters" aria-label="Filtrar proyectos por categoría">
            {filters.map((item) => (
              <button
                key={item.value}
                className={`filter-button${filter === item.value ? " active" : ""}`}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
                <span className="filter-count">
                  {item.value === "todos"
                    ? portfolio.projects.length
                    : portfolio.projects.filter((project) => project.category === item.value).length}
                </span>
              </button>
            ))}
          </Reveal>
        )}
        {filteredProjects.length ? (
          <div className="projects-grid">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                demoCount={portfolio.demos.filter((demo) => demo.projectId === project.id).length}
                requiresRegistration={!user}
                index={index}
                onOpen={() => openProject(project)}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            {portfolio.projects.length === 0
              ? "Todavía no hay proyectos publicados."
              : "Todavía no hay proyectos en esta categoría."}
          </p>
        )}
        {portfolio.projects.length > 0 && !user && (
          <div className="registration-callout">
            <span className="registration-icon" aria-hidden="true">✧</span>
            <p>
              Crear una cuenta toma menos de un minuto. Tus datos se usan
              únicamente para administrar tu acceso a la demo.
            </p>
            <button className="btn btn-outline-custom" type="button" onClick={onLogin}>
              Registrarme gratis <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
