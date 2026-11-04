import { useState } from "react";
import { teamInfo, teamMembers } from "../../data/portfolio.js";
import { formatDate } from "../../utils/records.js";
import MessageConversation from "../MessageConversation.jsx";

export default function MessagesManager({
  portfolio,
  setMessageStatus,
  replyToMessage,
  setNotice,
}) {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [subjectFilter, setSubjectFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const [sendingId, setSendingId] = useState("");

  const filtered = portfolio.messages.filter((msg) => {
    if (statusFilter !== "todos" && msg.status !== statusFilter) return false;
    if (subjectFilter !== "todos" && msg.subject !== subjectFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function handleStatusChange(message, nextStatus) {
    try {
      await setMessageStatus(message.id, nextStatus);
      setNotice(`Estado de consulta de ${message.name} actualizado a "${nextStatus}".`);
    } catch (err) {
      console.error("Error actualizando consulta:", err);
      setNotice("No se pudo actualizar el estado en Supabase.");
    }
  }

  async function handleReply(message) {
    const body = (drafts[message.id] ?? "").trim();
    if (!body) return;

    setSendingId(message.id);
    try {
      const result = await replyToMessage(message.id, body);
      setDrafts((current) => ({ ...current, [message.id]: "" }));
      setNotice(
        result.emailSent
          ? `Respuesta enviada por email a ${message.email}.`
          : `Respuesta guardada en la conversación de ${message.name}; revisa la configuración de correo para enviar avisos.`,
      );
    } catch (err) {
      console.error("Error guardando respuesta:", err);
      setNotice("No se pudo guardar la respuesta en Supabase.");
    } finally {
      setSendingId("");
    }
  }

  return (
    <article className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="eyebrow">Bandeja de entrada & Cotizaciones</span>
          <h3>Consultas recibidas ({portfolio.messages.length})</h3>
        </div>
      </div>

      {/* Filtros parametrizados y búsqueda */}
      <div className="row g-2 mb-3">
        <div className="col-sm-4">
          <input
            className="form-control form-control-sm"
            type="search"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-sm-4">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="nueva">Nuevas</option>
            <option value="en curso">En curso</option>
            <option value="respondida">Respondidas</option>
          </select>
        </div>
        <div className="col-sm-4">
          <select
            className="form-select form-select-sm"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filtrar por tipo de consulta"
          >
            <option value="todos">Todos los tipos</option>
            <option value="Cotización">Cotizaciones</option>
            <option value="Asesoría técnica">Asesoría técnica</option>
            <option value="Proyecto nuevo">Proyecto nuevo</option>
            <option value="Otra consulta">Otras consultas</option>
          </select>
        </div>
      </div>

      {filtered.length ? (
        <div className="message-list">
          {filtered.map((msg) => (
            <article className="message-item" key={msg.id}>
              <div className="message-header">
                <div>
                  <span className="eyebrow">
                    {msg.subject} · {formatDate(msg.createdAt)}
                  </span>
                  <h4>{msg.name}</h4>
                </div>
                <a
                  className="btn btn-outline-custom btn-sm"
                  href={`mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent(`Re: [${msg.subject}] Respuesta de ${teamInfo.name}`)}`}
                >
                  ✉ Responder por email
                </a>
              </div>

              <a className="message-email" href={`mailto:${msg.email}`}>
                {msg.email}
              </a>
              {msg.recipient && msg.recipient !== "all" && (
                <span className="message-recipient">
                  Destinatario: {teamMembers.find((member) => member.id === msg.recipient)?.name ?? "Equipo"}
                </span>
              )}

              <MessageConversation
                message={msg}
                replies={msg.portfolioMessageReplies ?? []}
              />

              <div className="d-flex align-items-center gap-2 mt-2">
                <label className="message-status-label m-0">
                  <span>Seguimiento:</span>
                  <select
                    className="form-select form-select-sm d-inline-block w-auto ms-2"
                    value={msg.status}
                    onChange={(e) => handleStatusChange(msg, e.target.value)}
                  >
                    <option value="nueva">Nueva</option>
                    <option value="en curso">En curso</option>
                    <option value="respondida">Respondida</option>
                  </select>
                </label>
              </div>
              <form
                className="customer-reply-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleReply(msg);
                }}
              >
                <label className="form-label" htmlFor={`operator-reply-${msg.id}`}>
                  Responder a {msg.name}
                </label>
                <textarea
                  className="form-control"
                  id={`operator-reply-${msg.id}`}
                  maxLength={3000}
                  rows={3}
                  value={drafts[msg.id] ?? ""}
                  onChange={(event) =>
                    setDrafts((current) => ({ ...current, [msg.id]: event.target.value }))
                  }
                  placeholder="Escribe una respuesta para guardar en la conversación y enviarla por email…"
                />
                <button
                  className="btn btn-primary-custom btn-sm mt-2"
                  type="submit"
                  disabled={!drafts[msg.id]?.trim() || sendingId === msg.id}
                >
                  {sendingId === msg.id ? "Guardando…" : "Guardar y responder ↗"}
                </button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">No hay mensajes coincidentes con los filtros seleccionados.</p>
      )}
    </article>
  );
}
