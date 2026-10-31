import { useState } from "react";
import { formatDate } from "../../utils/records.js";

export default function MessagesManager({ portfolio, setMessageStatus, setNotice }) {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [subjectFilter, setSubjectFilter] = useState("todos");
  const [search, setSearch] = useState("");

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
                  href={`mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent(`Re: [${msg.subject}] Respuesta de Equipo Fullstack`)}`}
                >
                  ✉ Responder por email
                </a>
              </div>

              <a className="message-email" href={`mailto:${msg.email}`}>
                {msg.email}
              </a>

              <p className="message-body-text">{msg.message}</p>

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
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">No hay mensajes coincidentes con los filtros seleccionados.</p>
      )}
    </article>
  );
}
