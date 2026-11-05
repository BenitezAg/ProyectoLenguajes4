import { useState } from "react";
import { teamMembers, timeline, teamInfo } from "../data/portfolio.js";
import { useSpeech } from "../utils/webApis.js";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

// --- COMPONENTE DEL MODAL (POP-UP) ---
function TeamModal({ member, onClose }) {
  if (!member) return null;

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="team-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        
        <div className="team-modal-grid">
          {/* Columna Izquierda: Foto Completa */}
          <div className="team-modal-image">
            {member.fullPhoto ? (
              <img src={member.fullPhoto} alt={`Foto de ${member.name}`} />
            ) : (
              <div className="team-modal-placeholder">{member.avatar || member.name.charAt(0)}</div>
            )}
          </div>

          {/* Columna Derecha: Datos Personales y Skills */}
          <div className="team-modal-info">
            <span className="eyebrow">{member.role}</span>
            <h2>{member.name}</h2>
            
            <div className="team-personal-data">
              <p><strong>Nivel de enseñanza:</strong> {member.education || "Estudiante Universitario"}</p>
              <p><strong>Ubicación:</strong> {member.location || "Argentina"}</p>
            </div>

            <p className="team-modal-bio">{member.bio}</p>

            <h4 className="skills-heading">Herramientas y Tecnologías</h4>
            <div className="team-skills-bars">
              {member.detailedSkills?.map((skill, i) => (
                <div key={i} className="skill-bar-container">
                  <div className="skill-bar-header">
                    <span>{skill.name}</span>
                    <span>{skill.percentage}%</span>
                  </div>
                  <div className="skill-track">
                    <span 
                      className="skill-fill" 
                      style={{ width: `${skill.percentage}%` }}
                    ></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Redes opcionales */}
            <div className="team-social-links mt-4">
              {member.github && <a href={member.github} target="_blank" rel="noreferrer" className="btn btn-outline-custom" style={{minHeight: '36px', fontSize: '0.8rem'}}>GitHub ↗</a>}
              {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" className="btn btn-outline-custom" style={{minHeight: '36px', fontSize: '0.8rem'}}>LinkedIn ↗</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- TARJETA DEL MIEMBRO (Clickable) ---
function MemberCard({ member, index, onClick }) {
  return (
    <Reveal
      className="card-base clickable-card"
      style={{ transitionDelay: `${index * 100}ms`, cursor: "pointer" }}
      onClick={() => onClick(member)}
    >
      <div className="team-avatar" aria-hidden="true">
         {member.avatar || member.name.charAt(0)}
      </div>
      
      <h4 className="team-member-name">{member.name}</h4>
      <span className="team-member-role">{member.role}</span>
      
      <p className="team-member-bio">{member.bio}</p>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--line)', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '500' }}>
        Ver perfil completo →
      </div>
    </Reveal>
  );
}

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <section id="equipo" className="section-padding section-separator">
      <div className="container">
        <SectionHeading
          eyebrow="Equipo Integrador"
          title="Nuestro equipo."
          description={teamInfo.description}
        />

        <div className="team-grid-container">
          {teamMembers.map((member, index) => (
            <MemberCard 
              key={member.id} 
              member={member} 
              index={index} 
              onClick={setSelectedMember} 
            />
          ))}
        </div>
      </div>

      <TeamModal 
        member={selectedMember} 
        onClose={() => setSelectedMember(null)} 
      />
    </section>
  );
}