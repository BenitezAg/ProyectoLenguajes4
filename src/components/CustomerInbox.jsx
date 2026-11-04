import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { formatDate } from "../utils/records.js";
import MessageConversation from "./MessageConversation.jsx";

export default function CustomerInbox({ onExit }) {
  const { portfolio, loading, storageError, refreshPortfolio, replyToMessage } = usePortfolio();
  const [drafts, setDrafts] = useState({});
  const [sendingId, setSendingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleRefresh() {
    setError("");
    try {
      await refreshPortfolio();
    } catch {
      setError("No se pudieron cargar tus consultas. Inténtalo otra vez.");
    }
  }

  async function handleReply(message) {
    const body = (drafts[message.id] ?? "").trim();
    if (!body) return;

    setSendingId(message.id);
    setError("");
    setNotice("");
    try {
      const result = await replyToMessage(message.id, body);
      setDrafts((current) => ({ ...current, [message.id]: "" }));
      setNotice(
        result.emailSent
          ? "Tu respuesta se guardó y se notificó al equipo."
          : "Tu respuesta quedó guardada; el equipo la verá en su bandeja.",
      );
    } catch (sendError) {
      console.error("No se pudo responder la consulta.", sendError);
      setError("No se pudo guardar la respuesta. Vuelve a intentarlo.");
    } finally {
      setSendingId("");
    }
  }

  return (
    <main className="inbox-page section-padding">
      <div className="container">
        <button className="text-link mb-4" type="button" onClick={onExit}>
          ← Volver al portfolio
        </button>
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">Tu cuenta · Mensajes</span>
            <h1>Mis consultas</h1>
            <p className="section-description">
              Lee las respuestas del equipo y continúa la conversación desde aquí.
            </p>
          </div>
          <button className="btn btn-outline-custom btn-sm" type="button" onClick={handleRefresh} disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>

        {notice && <p className="alert alert-success mt-3" role="status">{notice}</p>}
        {error && <p className="alert alert-danger mt-3" role="alert">{error}</p>}
        {storageError && <p className="alert alert-danger mt-3" role="alert">{storageError}</p>}
        {loading && portfolio.messages.length === 0 ? (
          <p className="empty-state">Cargando tus consultas…</p>
        ) : portfolio.messages.length ? (
          <div className="customer-inbox-list">
            {portfolio.messages.map((message) => (
              <article className="admin-panel customer-message-card" key={message.id}>
                <header className="message-header">
                  <div>
                    <span className="eyebrow">
                      {message.subject} · {formatDate(message.createdAt)}
                    </span>
                    <h2>{message.status}</h2>
                  </div>
                  <a className="message-email" href={`mailto:${message.email}`}>{message.email}</a>
                </header>
                <MessageConversation
                  message={message}
                  replies={message.portfolioMessageReplies ?? []}
                />
                <div className="customer-reply-form">
                  <label className="form-label" htmlFor={`reply-${message.id}`}>
                    Responder al equipo
                  </label>
                  <textarea
                    className="form-control"
                    id={`reply-${message.id}`}
                    maxLength={3000}
                    rows={3}
                    value={drafts[message.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({ ...current, [message.id]: event.target.value }))
                    }
                    placeholder="Escribe un mensaje para continuar la conversación…"
                  />
                  <button
                    className="btn btn-primary-custom btn-sm mt-2"
                    type="button"
                    disabled={!drafts[message.id]?.trim() || sendingId === message.id}
                    onClick={() => void handleReply(message)}
                  >
                    {sendingId === message.id ? "Enviando…" : "Enviar respuesta ↗"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : !storageError ? (
          <p className="empty-state">Todavía no enviaste consultas desde esta cuenta.</p>
        ) : null}
      </div>
    </main>
  );
}
