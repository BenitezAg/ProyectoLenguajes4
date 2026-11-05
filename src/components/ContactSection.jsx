import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { teamMembers } from "../data/portfolio.js";
import { createGuestAccess, createGuestAccessUrl } from "../utils/guestAccess.js";
import { copyToClipboard } from "../utils/webApis.js";
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
  const { addMessage, loading, backendConfigured, backendReady } = usePortfolio();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    name: user?.name ?? "",
    email: user?.email ?? "",
  }));
  const [feedback, setFeedback] = useState(null);
  const [sending, setSending] = useState(false);
  const [followUpUrl, setFollowUpUrl] = useState("");
  const [copied, setCopied] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFeedback(null);
    setFollowUpUrl("");
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

      const guestAccess = user ? null : await createGuestAccess();

      const result = await addMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
        recipient: form.recipient,
        guestAccessHash: guestAccess?.hash,
        guestAccessToken: guestAccess?.token,
      });

      setFeedback({
        type: result.emailSent ? "success" : "warning",
        text: result.emailSent
          ? `Tu consulta para ${recipientName} se guardó y notificamos al equipo por email.`
          : `Tu consulta para ${recipientName} se guardó. El equipo podrá responderte desde la bandeja de consultas.`,
      });
      if (guestAccess) {
        setFollowUpUrl(createGuestAccessUrl(guestAccess.token));
      }
      setForm({
        ...initialForm,
        name: user?.name ?? "",
        email: user?.email ?? "",
      });
    } catch (error) {
      console.error("Error al enviar consulta:", error);
      setFeedback({
        type: "danger",
        text: error.message || "No se pudo guardar la consulta. Comprueba tu conexión e inténtalo otra vez.",
      });
    } finally {
      setSending(false);
    }
  }

  const disabled = loading || sending || !backendConfigured || !backendReady;

  return (
    <section id="contacto" className="section-padding contact-section">
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <SectionHeading
              eyebrow="Contacto directo · 4 Integrantes"
              title="Conversemos."
              description="Envíanos una consulta o propuesta para que el equipo pueda revisarla."
            />
            <Reveal className="contact-team-list mt-4">
              <span className="eyebrow">Contacto del equipo</span>
              <p>Comunícate con el equipo mediante este formulario.</p>
              <span className="eyebrow mt-3">Integrantes directos</span>
              <ul className="team-quick-contacts">
                {teamMembers.map((member) => (
                  <li key={member.id}>
                    <strong>{member.name}</strong>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="col-lg-6 offset-lg-1">
            <Reveal className="contact-form-card">
              {!backendConfigured && (
                <p className="alert alert-warning" role="status">
                  La vista previa está disponible. El formulario se habilitará cuando la base de datos del proyecto esté conectada.
                </p>
              )}
              {backendConfigured && backendReady && !loading && (
                <p className="contact-guest-note">
                  Puedes enviar una consulta sin crear una cuenta. Te daremos un enlace privado para seguir la conversación.
                </p>
              )}
              {backendConfigured && loading && (
                <p className="contact-guest-note" role="status">
                  Comprobando la disponibilidad del formulario…
                </p>
              )}
              {backendConfigured && !loading && !backendReady && (
                <p className="alert alert-warning" role="status">
                  No podemos recibir consultas en este momento. Inténtalo más tarde.
                </p>
              )}
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
                          {m.name}
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
                      placeholder="Describe tu consulta o propuesta con el mayor detalle posible..."
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
                {followUpUrl && (
                  <div className="alert alert-info mt-3" role="status">
                    <p className="mb-2">
                      Guarda este enlace privado para leer las respuestas y continuar la conversación. Cualquier persona que lo tenga podrá verla.
                    </p>
                    <a className="guest-follow-up-link" href={followUpUrl}>
                      Abrir mi conversación ↗
                    </a>
                    <button
                      className="btn btn-ghost btn-sm ms-2"
                      type="button"
                      onClick={async () => {
                        try {
                          const didCopy = await copyToClipboard(followUpUrl);
                          setCopied(didCopy);
                          if (!didCopy) {
                            setFeedback({
                              type: "warning",
                              text: "Este navegador no permite copiar automáticamente. Abre tu conversación y guarda el enlace de la barra del navegador.",
                            });
                          }
                        } catch (error) {
                          console.error("No se pudo copiar el enlace de seguimiento.", error);
                          setFeedback({
                            type: "warning",
                            text: "No se pudo copiar automáticamente. Abre tu conversación y guarda el enlace de la barra del navegador.",
                          });
                        }
                      }}
                    >
                      {copied ? "✓ Enlace copiado" : "Copiar enlace"}
                    </button>
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
