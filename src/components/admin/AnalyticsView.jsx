import { useMemo, useState } from "react";
import StatCard from "./StatCard.jsx";
import { formatDate } from "../../utils/records.js";

const TODAY = new Date();

export default function AnalyticsView({ portfolio, setTab }) {
  const [daysCount, setDaysCount] = useState(7);
  const analytics = portfolio.analytics;
  const messages = portfolio.messages;

  // Gráfico 1: Tráfico diario y registros
  const dailyData = useMemo(() => {
    return Array.from({ length: daysCount }, (_, index) => {
      const date = new Date(TODAY);
      date.setDate(TODAY.getDate() - (daysCount - 1) + index);
      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      const found = analytics.dailyVisits.find((item) => item.date === key);
      return {
        date: key,
        label: new Intl.DateTimeFormat("es-AR", { weekday: "short" })
          .format(date)
          .replace(".", ""),
        visits: found?.visits ?? 0,
        registered: found?.registered ?? 0,
      };
    });
  }, [daysCount, analytics.dailyVisits]);

  const maxVisits = Math.max(1, ...dailyData.map((d) => d.visits));

  // Gráfico 2: Distribución parametrizada por tipo de consulta
  const subjectDistribution = useMemo(() => {
    const counts = {
      Cotización: 0,
      "Asesoría técnica": 0,
      "Proyecto nuevo": 0,
      "Otra consulta": 0,
    };
    for (const m of messages) {
      if (counts[m.subject] !== undefined) counts[m.subject]++;
      else counts["Otra consulta"]++;
    }
    const total = messages.length || 1;
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [messages]);

  const pendingCount = messages.filter((m) => m.status === "nueva").length;
  const recentMessages = [...messages].slice(0, 4);

  return (
    <div className="admin-analytics-view">
      {/* Contadores Clave (Requisito 3) */}
      <div className="stats-grid">
        <StatCard
          label="Visitas generales"
          value={analytics.visits}
          detail="Control de tráfico total del sitio"
          icon="↗"
        />
        <StatCard
          label="Visitas de usuarios registrados"
          value={analytics.registeredVisits}
          detail="Accesos con sesión activa"
          icon="◎"
        />
        <StatCard
          label="Usuarios registrados"
          value={portfolio.users.length}
          detail="Cuentas habilitadas para demos"
          icon="◉"
        />
        <StatCard
          label="Consultas totales"
          value={messages.length}
          detail={`${pendingCount} nuevas sin responder`}
          icon="✉"
        />
      </div>

      <div className="row g-4 mt-1">
        {/* Gráfico 1: Actividad y Tráfico */}
        <div className="col-lg-7">
          <article className="admin-panel chart-panel h-100">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Tráfico y accesos</span>
                <h3>Flujo de visitas y usuarios</h3>
              </div>
              <div className="chart-controls d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  value={daysCount}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                  aria-label="Periodo de análisis"
                >
                  <option value={7}>Últimos 7 días</option>
                  <option value={14}>Últimos 14 días</option>
                </select>
              </div>
            </div>

            <div className="chart-legend mb-3">
              <span><i className="legend-total" /> Visitas generales</span>
              <span><i className="legend-registered" /> Usuarios autenticados</span>
            </div>

            <div className="chart-bars" role="img" aria-label="Gráfico de visitas">
              {dailyData.map((day) => (
                <div className="chart-day" key={day.date}>
                  <span className="chart-value">{day.visits || "·"}</span>
                  <div className="chart-bar-track">
                    <span
                      className="chart-bar-total"
                      style={{ height: `${Math.max(4, (day.visits / maxVisits) * 100)}%` }}
                    />
                    {day.registered > 0 && (
                      <span
                        className="chart-bar-registered"
                        style={{ height: `${(day.registered / maxVisits) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="chart-day-label">{day.label}</span>
                </div>
              ))}
            </div>
            <p className="chart-footnote mt-3 mb-0">
              Datos registrados en tiempo real mediante Supabase PostgreSQL.
            </p>
          </article>
        </div>

        {/* Gráfico 2: Consultas Parametrizadas (Requisito 4) */}
        <div className="col-lg-5">
          <article className="admin-panel chart-panel h-100">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Consultas por categoría</span>
                <h3>Tipos de solicitudes</h3>
              </div>
            </div>

            <div className="query-distribution-list">
              {subjectDistribution.map((item) => (
                <div key={item.type} className="query-dist-item mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="dist-type-name">{item.type}</span>
                    <strong className="dist-count">{item.count} ({item.pct}%)</strong>
                  </div>
                  <div className="progress progress-custom" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${item.pct}%` }}
                      aria-valuenow={item.pct}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="chart-footnote mt-auto mb-0">
              Distribución de consultas clasificadas para cotización y asesoría.
            </p>
          </article>
        </div>
      </div>

      {/* Consultas recientes */}
      <article className="admin-panel mt-4">
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">Entrada reciente</span>
            <h3>Últimas consultas recibidas</h3>
          </div>
          <button className="text-link" type="button" onClick={() => setTab("consultas")}>
            Ver todas en detalle →
          </button>
        </div>
        {recentMessages.length ? (
          <div className="admin-list">
            {recentMessages.map((msg) => (
              <div className="admin-list-row" key={msg.id}>
                <span className={`status-dot status-${msg.status.replace(" ", "-")}`} aria-hidden="true" />
                <div className="admin-list-main">
                  <strong>{msg.name}</strong>
                  <span>{msg.subject} · {msg.email}</span>
                </div>
                <span className="admin-list-date">{formatDate(msg.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">Las consultas recibidas se mostrarán aquí.</p>
        )}
      </article>
    </div>
  );
}
