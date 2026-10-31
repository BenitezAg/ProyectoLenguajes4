import Reveal from "./Reveal.jsx";

export default function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <Reveal className="section-heading mb-4">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 id={id} className="section-title">{title}</h2>
      {description && <p className="section-description mb-0">{description}</p>}
    </Reveal>
  );
}
