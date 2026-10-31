import { useEffect, useState } from "react";
import { teamInfo, teamMembers } from "../data/portfolio.js";

const phrases = [
  "Equipo de 4 desarrolladores full stack.",
  "React 19 + PostgreSQL con Row Level Security.",
  "Microinteracciones fluidas y Web APIs nativas.",
  "Arquitectura robusta de la BD al frontend.",
];

function useTypingEffect() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const completed = !deleting && text === phrase;
    const pauseAtEnd = completed ? 1800 : 0;
    const delay = pauseAtEnd || (deleting ? 32 : 70);

    const timeout = window.setTimeout(() => {
      if (completed) {
        setDeleting(true);
      } else if (deleting && text.length === 0) {
        setDeleting(false);
        setPhraseIndex((index) => (index + 1) % phrases.length);
      } else {
        setText(phrase.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [phraseIndex, text, deleting]);

  return text;
}

export default function Hero() {
  const typedText = useTypingEffect();

  return (
    <header id="inicio" className="hero-section">
      <div className="container position-relative hero-inner">
        <div className="hero-team-tag">
          <span className="team-pill">4 Integrantes</span>
          <span className="hero-index">Trabajo Práctico Integrador · Lenguajes IV</span>
        </div>

        <p className="hero-overline">{teamInfo.tagline}</p>
        <h1 className="hero-title">
          Desarrollamos soluciones
          <br />
          <span className="hero-accent">para que las ideas escalen.</span>
        </h1>

        <div className="hero-caption" aria-live="polite">
          <span className="typing-indicator" aria-hidden="true" />
          <span>{typedText}</span>
          <span className="typing-cursor" aria-hidden="true">|</span>
        </div>

        <p className="hero-intro">
          Portfolio interactivo desarrollado colaborativamente por {teamMembers.length} integrantes.
          Combina React 19, Supabase (PostgreSQL con RLS), Bootstrap 5, APIs Web avanzadas y animaciones fluidas.
        </p>

        <div className="d-flex flex-wrap gap-3 hero-actions">
          <a className="btn btn-primary-custom" href="#proyectos">
            Explorar proyectos <span aria-hidden="true">↗</span>
          </a>
          <a className="btn btn-outline-custom" href="#equipo">
            Conocer al equipo
          </a>
          <a className="btn btn-ghost" href="#contacto">
            Hablemos
          </a>
        </div>

        <div className="hero-footnote">
          <span>{teamMembers.map((m) => m.name.split(" ")[0]).join(" · ")}</span>
          <span>Desarrollo en equipo · Disponible para proyectos</span>
        </div>
      </div>
      <a className="hero-scroll" href="#equipo" aria-label="Ir a la sección de equipo">
        ↓
      </a>
    </header>
  );
}
