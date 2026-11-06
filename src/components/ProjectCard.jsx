import Reveal from "./Reveal.jsx";

export default function ProjectCard({ project, index }) {
  // Función para abrir la página en una nueva pestaña
  const handleClick = () => {
    if (project.url) {
      window.open(project.url, "_blank");
    }
  };

  return (
    <Reveal 
      className="card-base project-card" 
      style={{ transitionDelay: `${index * 100}ms` }} 
      onClick={handleClick}
    >
      {/* Previsualización de la imagen */}
      {project.image && (
        <div className="project-preview">
          <img src={project.image} alt={project.title} />
        </div>
      )}
      
      {/* Contenido de la tarjeta */}
      <div className="project-card-content">
        <span className="project-category">{project.category}</span>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
      </div>
      
      <div className="project-arrow" aria-hidden="true">↗</div>
    </Reveal>
  );
}