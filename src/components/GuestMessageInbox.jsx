import { useCallback, useEffect, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { toCamelCaseRecord } from "../utils/records.js";
import MessageConversation from "./MessageConversation.jsx";

export default function GuestMessageInbox({ accessToken, onExit }) {
  const { backendConfigured, getGuestMessage, replyToGuestMessage } = usePortfolio();
  const [message, setMessage] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMessage = useCallback(async () => {
    if (!backendConfigured) {
      setError("El seguimiento de consultas no está disponible en esta vista previa.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await getGuestMessage(accessToken);
      if (!result) {
        setMessage(null);
        setError("El enlace de seguimiento no es válido. Usa el enlace que recibiste al enviar la consulta.");
      } else {
        setMessage({
          ...toCamelCaseRecord(result),
          replies: (result.replies ?? []).map((reply) => toCamelCaseRecord(reply)),
        });
      }
    } catch (loadError) {
      console.error("No se pudo cargar la consulta de invitado.", loadError);
      setError("No se pudo cargar la conversación. Comprueba tu conexión e inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, backendConfigured, getGuestMessage]);

  useEffect(() => {
    void loadMessage();
  }, [loadMessage]);

  async function handleReply(event) {
    event.preventDefault();
    if (!draft.trim()) return;

    setSending(true);
    setError("");
    setNotice("");
    try {
      const result = await replyToGuestMessage(accessToken, draft);
      setDraft("");
      setNotice(
        result.emailSent
          ? "Tu respuesta se guardó y se notificó al equipo."
          : "Tu respuesta quedó guardada para el equipo.",
      );
      await loadMessage();
    } catch (replyError) {
      console.error("No se pudo responder la consulta como invitado.", replyError);
      setError("No se pudo guardar tu respuesta. Vuelve a intentarlo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="inbox-page section-padding">
      <div className="container">
        <button className="text-link mb-4" type="button" onClick={onExit}>
          ← Volver al portfolio
        </button>
        <span className="eyebrow">Seguimiento privado · Acceso de invitado</span>
        <h1>Tu conversación con el equipo</h1>
        <p className="section-description">
          Guarda este enlace para volver a consultar las respuestas. Cualquier persona con el enlace puede acceder a esta conversación.
        </p>

        {notice && <p className="alert alert-success mt-3" role="status">{notice}</p>}
        {error && <p className="alert alert-danger mt-3" role="alert">{error}</p>}
        {loading ? (
          <p className="empty-state">Cargando conversación…</p>
        ) : message ? (
          <article className="admin-panel guest-message-card">
            <div className="message-header">
              <div>
                <span className="eyebrow">{message.subject}</span>
                <h2>{message.status}</h2>
              </div>
            </div>
            <MessageConversation message={message} replies={message.replies ?? []} />
            <form className="customer-reply-form" onSubmit={handleReply}>
              <label className="form-label" htmlFor="guest-reply">Responder al equipo</label>
              <textarea
                className="form-control"
                id="guest-reply"
                maxLength={3000}
                minLength={1}
                required
                rows={3}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escribe un mensaje para continuar la conversación…"
              />
              <button className="btn btn-primary-custom btn-sm mt-2" type="submit" disabled={sending}>
                {sending ? "Enviando…" : "Enviar respuesta ↗"}
              </button>
            </form>
          </article>
        ) : null}
      </div>
    </main>
  );
}
