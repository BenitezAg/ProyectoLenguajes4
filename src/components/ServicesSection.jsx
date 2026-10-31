import { usePortfolio } from "../context/PortfolioContext.jsx";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

export default function ServicesSection() {
  const { portfolio } = usePortfolio();

  return (
    <section id="servicios" className="section-padding services-section">
      <div className="container">
        <SectionHeading
          eyebrow="En qué puedo ayudarte"
          title="Ideas, estrategia y desarrollo."
          description="Colaboro en distintas etapas de un producto digital: desde el primer boceto hasta una aplicación lista para crecer."
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
            <p className="text-muted-custom">Pronto publicaré nuevos servicios.</p>
          )}
        </div>
      </div>
    </section>
  );
}
