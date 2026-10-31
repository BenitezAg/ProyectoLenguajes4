import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { teamInfo, teamMembers } from "../data/portfolio.js";
import Reveal from "./Reveal.jsx";
import SectionHeading from "./SectionHeading.jsx";

const initialForm = {
  name: "",
  email: "",
  subject: "Cotización",
  recipient: "all",
  message: "",
};

const SUBJECT_OPTIONS = [
  { value: "Cotización", label: "Cotización de proyectos" },
  { value: "Asesoría técnica", label: "Asesoría técnica" },
  { value: "Otra consulta", label: "Consultas generales" },
  { value: "Proyecto nuevo", label: "Nuevo proyecto" },
];

export default function ContactSection({ user }) {
  const { addMessage, loading } = usePortfolio();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    name: user?.name ?? "",
    email: user?.email ?? "",
  }));
  const [feedback, setFeedback] = useState(null);
  const [sending, setSending] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFeedback(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.message.trim().length < 20) {
      setFeedback({
        type: "danger",
        text: "El mensaje debe contener al menos 20 caracteres para procesar tu consulta correctamente.",
      });
      return;
    }

    setSending(true);
    try {
      const recipientName =
        form.recipient === "all"
          ? "Todo el equipo"
          : teamMembers.find((m) => m.id === form.recipient)?.name ?? "Equipo";

      const fullMessage =
        form.recipient !== "all"
          ? `[Dirigido a: ${recipientName}]\n\n${form.message.trim()}`
          : form.message.trim();

      const result = await addMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: fullMessage,
      });

      setFeedback({
        type: result.emailSent ? "success" : "warning",
        text: result.emailSent
          ? `¡Gracias! Tu consulta dirigida a ${recipientName} se guardó en Supabase y notificamos al equipo por email.`
          : `Tu consulta dirigida a ${recipientName} quedó registrada en el sistema.`,
      });
      setForm({
        ...initialForm,
        name: user?.name ?? "",
        email: user?.email ?? "",
      });
    } catch (error) {
      console.error("Error al enviar consulta:", error);
      setFeedback({
        type: "danger",
        text: "No se pudo enviar el mensaje a Supabase. Revisa tu conexión y vuelve a intentarlo.",
      });
    } finally {
      setSending(false);
    }
  }

  const disabled = loading || sending;

  return (
    <section id="contacto" className="section-padding contact-section">
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <SectionHeading
              eyebrow="Contacto directo · 4 Integrantes"
              title="¿Empezamos a trabajar?"
              description="Envíanos tu consulta, solicitud de cotización o inquietud técnica. Respondemos a la brevedad."
            />
            <Reveal className="contact-team-list mt-4">
              <span className="eyebrow">Contacto general del colectivo</span>
              <p className="contact-main-email">
                ✉ <a href={`mailto:${teamInfo.email}`}>{teamInfo.email}</a>
              </p>
              <span className="eyebrow mt-3">Integrantes directos</span>
              <ul className="team-quick-contacts">
                {teamMembers.map((member) => (
                  <li key={member.id}>
                    <strong>{member.name}</strong> ·{" "}
                    <span className="text-muted">{member.role}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="col-lg-6 offset-lg-1">
            <Reveal className="contact-form-card">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="contact-name">
                      Nombre completo *
                    </label>
                    <input
                      autoComplete="name"
                      className="form-control"
                      id="contact-name"
                      maxLength={70}
                      minLength={2}
                      name="name"
                      onChange={updateField}
                      placeholder="Ej. Carla Sánchez"
                      required
                      value={form.name}
                      disabled={disabled}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="contact-email">
                      Correo electrónico *
                    </label>
                    <input
                      autoComplete="email"
                      className="form-control"
                      id="contact-email"
                      maxLength={254}
                      name="email"
                      onChange={updateField}
                      placeholder="nombre@ejemplo.com"
                      required
                      type="email"
                      value={form.email}
                      disabled={disabled}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="contact-subject">
                      Tipo de consulta *
                    </label>
                    <select
                      className="form-select"
                      id="contact-subject"
                      name="subject"
                      onChange={updateField}
                      value={form.subject}
                      disabled={disabled}
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="contact-recipient">
                      Destinatario preferido
                    </label>
                    <select
                      className="form-select"
                      id="contact-recipient"
                      name="recipient"
                      onChange={updateField}
                      value={form.recipient}
                      disabled={disabled}
                    >
                      <option value="all">Equipo completo ({teamMembers.length} integrantes)</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role.split("&")[0].trim()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label" htmlFor="contact-message">
                        Mensaje o requerimiento *
                      </label>
                      <small className="char-count text-muted">
                        {form.message.length}/3000 (mínimo 20)
                      </small>
                    </div>
                    <textarea
                      className="form-control"
                      id="contact-message"
                      maxLength={3000}
                      minLength={20}
                      name="message"
                      onChange={updateField}
                      placeholder="Describe tu proyecto, cotización requerida o consulta técnica detallada..."
                      required
                      rows={4}
                      value={form.message}
                      disabled={disabled}
                    />
                  </div>
                </div>

                {feedback && (
                  <div
                    className={`alert alert-${feedback.type} mt-3 mb-0`}
                    role="alert"
                  >
                    {feedback.text}
                  </div>
                )}

                <div className="mt-4 d-flex justify-content-between align-items-center">
                  <span className="required-note text-muted">* Campos obligatorios</span>
                  <button
                    className="btn btn-primary-custom"
                    disabled={disabled}
                    type="submit"
                  >
                    {sending ? "Enviando mensaje..." : "Enviar consulta ↗"}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
