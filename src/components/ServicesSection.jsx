import { usePortfolio } from "../context/PortfolioContext.jsx";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

export default function ServicesSection() {
  const { portfolio } = usePortfolio();

  return (
    <section id="servicios" className="section-padding services-section">
      <div className="container">
        <SectionHeading
          eyebrow={portfolio.services.length ? "Qué ofrece el equipo" : "Sección en preparación"}
          title="Servicios."
          description={
            portfolio.services.length
              ? "Servicios y áreas de trabajo disponibles para proyectos digitales."
              : "El equipo publicará aquí sus servicios cuando estén definidos."
          }
        />
        <div className="row g-3">
          {portfolio.services.map((service, index) => (
            <div className="col-md-6 col-lg-4" key={service.id}>
              <Reveal
                as="article"
                className="service-card"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <span className="service-icon" aria-hidden="true">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="service-index">0{index + 1} / 0{portfolio.services.length}</span>
              </Reveal>
            </div>
          ))}
          {portfolio.services.length === 0 && (
            <p className="text-muted-custom">Todavía no hay servicios publicados.</p>
          )}
        </div>
      </div>
    </section>
  );
}
