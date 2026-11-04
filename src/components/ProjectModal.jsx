import { useEffect, useState } from "react";
import DemoPreview from "./DemoPreview.jsx";
import { shareContent, useSpeech } from "../utils/webApis.js";

export default function ProjectModal({ project, demos, onClose }) {
  const { speak, stop, speaking, isSupported } = useSpeech();
  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    if (!project) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stop();
    };
  }, [project, onClose, stop]);

  if (!project) return null;

  const handleSpeech = () => {
    if (speaking) {
      stop();
    } else {
      speak(`${project.title}. ${project.description}. Tecnologías empleadas: ${project.technologies}.`);
    }
  };

  const handleShare = async () => {
    setShareError("");
    try {
      const success = await shareContent({
        title: project.title,
        text: project.description,
        url: window.location.href,
      });
      if (success) {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (error) {
      console.error("No se pudo compartir el proyecto.", error);
      setShareError("No se pudo compartir ni copiar el enlace en este navegador.");
    }
  };

  return (
    <div
      className="modal-backdrop-custom"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Cerrar detalles del proyecto"
          onClick={onClose}
        >
          ×
        </button>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <span className="eyebrow m-0">{project.technologies}</span>
          <div className="d-flex gap-2">
            {isSupported && (
              <button
                type="button"
                className="btn-web-api"
                onClick={handleSpeech}
                title="Escuchar descripción (Web Speech API)"
              >
                {speaking ? "⏹ Silenciar" : "🔊 Narrar"}
              </button>
            )}
            <button
              type="button"
              className="btn-web-api"
              onClick={handleShare}
              title="Compartir enlace (Web Share API)"
            >
              {shared ? "✓ Compartido" : "🔗 Compartir"}
            </button>
          </div>
        </div>
        {shareError && <p className="alert alert-warning mt-2" role="status">{shareError}</p>}

        <h2 id="project-modal-title">
          {project.emoji} {project.title}
        </h2>

        {project.members && (
          <p className="project-members-modal">
            <strong>Desarrollado por:</strong> {project.members.join(", ")}
          </p>
        )}

        <p className="section-description">{project.description}</p>
        <hr className="modal-divider" />

        <h3 className="demo-heading">Demos interactivas</h3>
        {demos.length ? (
          <div className="demo-list">
            {demos.map((demo) => (
              <article className="demo-item" key={demo.id}>
                <div>
                  <h4>{demo.name}</h4>
                  <p>{demo.description}</p>
                </div>
                <DemoPreview demo={demo} />
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            Las demos de este proyecto están en preparación.
          </p>
        )}
      </section>
    </div>
  );
}
