import { teamMembers, timeline, teamInfo } from "../data/portfolio.js";
import { useSpeech } from "../utils/webApis.js";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

function MemberCard({ member, index }) {
  const { speak, stop, speaking, isSupported } = useSpeech();

  const handleToggleSpeech = () => {
    if (speaking) {
      stop();
    } else {
      speak(`${member.name}. ${member.role}. ${member.bio}`);
    }
  };

  return (
    <Reveal
      className={`team-card team-card-${member.color}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="team-card-header">
        <div className="team-avatar" aria-hidden="true">
          <span>{member.avatar}</span>
        </div>
        <div className="team-card-title-box">
          <h4 className="team-member-name">{member.name}</h4>
          <span className="team-member-role">{member.role}</span>
        </div>
      </div>

      <p className="team-member-bio">{member.bio}</p>

      {member.skills.length > 0 && (
        <div className="team-skills-tags">
          {member.skills.map((skill) => (
            <span key={skill} className="team-skill-badge">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="team-card-footer">
        <div className="team-social-links">
          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              className="team-link-icon"
              title="GitHub"
              aria-label={`GitHub de ${member.name}`}
            >
              GH ↗
            </a>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="team-link-icon"
              title="LinkedIn"
              aria-label={`LinkedIn de ${member.name}`}
            >
              IN ↗
            </a>
          )}
        </div>

        <div className="team-actions">
          {isSupported && <button
            type="button"
            className="btn-web-api"
            onClick={handleToggleSpeech}
            title={speaking ? "Detener voz" : "Escuchar perfil (Web Speech API)"}
            aria-label={speaking ? "Detener narración" : `Escuchar perfil de ${member.name}`}
          >
            {speaking ? "⏹ Silenciar" : "🔊 Voz"}
          </button>}
        </div>
      </div>
    </Reveal>
  );
}

export default function TeamSection() {
  return (
    <section id="equipo" className="section-padding team-section">
      <div className="container">
        <SectionHeading
          eyebrow="Equipo Integrador · 4 Integrantes"
          title="Nuestro equipo."
          description={teamInfo.description}
        />

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>

        <div className="team-trajectory mt-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <Reveal className="trajectory-highlight">
                <span className="eyebrow">Metodología y sinergia</span>
                <h3>Un portfolio construido en equipo</h3>
                <p>
                  Este espacio reúne la presentación del equipo y permite compartir
                  proyectos y recibir consultas en un mismo lugar.
                </p>
                <a className="btn btn-outline-custom mt-2" href="#contacto">
                  Contactar al equipo ↗
                </a>
              </Reveal>
            </div>
            <div className="col-lg-7">
              <div className="timeline-list">
                {timeline.map((item, index) => (
                  <Reveal
                    key={item.role}
                    className="timeline-item"
                    style={{ transitionDelay: `${index * 110}ms` }}
                  >
                    <span className="timeline-period">{item.period}</span>
                    <h4>{item.role}</h4>
                    <p>{item.detail}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
