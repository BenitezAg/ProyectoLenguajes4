import { skillGroups } from "../data/portfolio.js";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

function SkillCard({ group, index }) {
  return (
    <Reveal
      as="article"
      className="skill-group"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="skill-group-heading">
        <span className="skill-group-icon" aria-hidden="true">{group.icon}</span>
        <div>
          <h3>{group.title}</h3>
          <p>{group.description}</p>
        </div>
      </div>
      <div className="skill-list">
        {group.skills.map((skill) => (
          <span className="skill-badge" key={skill}>{skill}</span>
        ))}
      </div>
    </Reveal>
  );
}

export default function SkillsSection() {
  return (
    <section id="tecnologias" className="section-padding skills-section">
      <div className="container">
        <SectionHeading
          eyebrow="Tecnologías"
          title="Tecnologías del proyecto."
          description="Herramientas utilizadas en esta entrega integradora."
        />
        <div className="row g-3">
          {skillGroups.map((group, index) => (
            <div className="col-md-6 col-lg-4" key={group.title}>
              <SkillCard group={group} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
