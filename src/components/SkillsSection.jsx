import { useState } from "react";
import { skillGroups } from "../data/portfolio.js";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

function SkillCard({ group, index }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Reveal
      as="article"
      className="skill-group"
      onVisible={() => setRevealed(true)}
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
          <div className="skill-item" key={skill.name}>
            <div className="d-flex justify-content-between gap-2">
              <span>{skill.name}</span>
              <span className="skill-percent">{revealed ? `${skill.value}%` : "0%"}</span>
            </div>
            <div
              className="skill-track"
              role="meter"
              aria-label={skill.name}
              aria-valuenow={revealed ? skill.value : 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span
                className="skill-fill"
                style={{ width: revealed ? `${skill.value}%` : "0%" }}
              />
            </div>
          </div>
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
          title="De punta a punta."
          description="Elijo las herramientas según las necesidades del proyecto, no al revés."
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
