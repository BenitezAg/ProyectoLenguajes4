import Reveal from "./Reveal.jsx";

const categories = {
  web: "Web",
  diseno: "Diseño",
  app: "Apps",
};

export default function ProjectCard({
  project,
  demoCount,
  onOpen,
  index,
  requiresRegistration,
}) {
  return (
    <Reveal
      as="button"
      type="button"
      className={`project-card project-${project.color}`}
      onClick={onOpen}
      aria-label={`${project.title}. ${demoCount ? `${demoCount} demo${demoCount === 1 ? "" : "s"} interactiva${demoCount === 1 ? "" : "s"}` : "Sin demos disponibles"}`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      <span className="project-index">0{String(index + 1).padStart(2, "0")}</span>
      <span className="project-emoji" aria-hidden="true">{project.emoji}</span>
      <span className="project-card-content">
        <span className="project-category">{categories[project.category] ?? project.category}</span>
        <span className="project-title">{project.title}</span>
        <span className="project-description">
          {requiresRegistration ? "Regístrate para descubrir todos los detalles y demos." : project.description}
        </span>
        {!requiresRegistration && (
          <span className="project-tech">{project.technologies}</span>
        )}
        {project.members && project.members.length > 0 && !requiresRegistration && (
          <span className="project-members-tag">
            👥 {project.members.join(" · ")}
          </span>
        )}
      </span>
      <span className="project-arrow" aria-hidden="true">↗</span>
    </Reveal>
  );
}
