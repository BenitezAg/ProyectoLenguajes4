import { useMemo, useState } from "react";
import StatCard from "./StatCard.jsx";
import { formatDate } from "../../utils/records.js";
import {
  addDays,
  calculatePeriodMetrics,
  generateDateSequence,
  getArgentinaToday,
  getHistoryEarliestDate,
  groupMessagesBySubject,
  groupUsersByDay,
  groupVisitsByDay,
  validateDateRange,
} from "../../utils/analytics.js";

export default function AnalyticsView({ portfolio, setTab }) {
  const analytics = portfolio.analytics;
  const messages = portfolio.messages;
  const users = portfolio.users;

  // Fecha local de Argentina (UTC-3) calculada al renderizar (evita constante de módulo)
  const today = useMemo(() => getArgentinaToday(), []);

  // Rango de fechas: por defecto últimos 7 días
  const [startDate, setStartDate] = useState(() => addDays(getArgentinaToday(), -6));
  const [endDate, setEndDate] = useState(() => getArgentinaToday());

  // Validación del rango de fechas seleccionado
  const rangeValidation = useMemo(
    () => validateDateRange(startDate, endDate),
    [startDate, endDate],
  );

  // Botones de acceso rápido
  const handlePreset7Days = () => {
    const currentToday = getArgentinaToday();
    setStartDate(addDays(currentToday, -6));
    setEndDate(currentToday);
  };

  const handlePreset30Days = () => {
    const currentToday = getArgentinaToday();
    setStartDate(addDays(currentToday, -29));
    setEndDate(currentToday);
  };

  const handlePresetAllHistory = () => {
    const currentToday = getArgentinaToday();
    const earliest = getHistoryEarliestDate({
      dailyVisits: analytics.dailyVisits,
      users,
      messages,
      fallbackDate: addDays(currentToday, -29),
    });
    setStartDate(earliest);
    setEndDate(currentToday);
  };

  // Identificador de preset activo
  const activePreset = useMemo(() => {
    const currentToday = getArgentinaToday();
    if (endDate !== currentToday) return null;
    if (startDate === addDays(currentToday, -6)) return "7d";
    if (startDate === addDays(currentToday, -29)) return "30d";
    const earliest = getHistoryEarliestDate({
      dailyVisits: analytics.dailyVisits,
      users,
      messages,
      fallbackDate: addDays(currentToday, -29),
    });
    if (startDate === earliest) return "all";
    return null;
  }, [startDate, endDate, analytics.dailyVisits, users, messages]);

  // Secuencia de fechas en el rango
  const dateSequence = useMemo(() => {
    if (!rangeValidation.isValid) return [];
    return generateDateSequence(startDate, endDate);
  }, [startDate, endDate, rangeValidation.isValid]);

  // Gráfico 1: Visitas diarias (totales vs registradas)
  const dailyVisitsData = useMemo(() => {
    if (!dateSequence.length) return [];
    return groupVisitsByDay(analytics.dailyVisits, dateSequence);
  }, [analytics.dailyVisits, dateSequence]);

  const maxVisits = useMemo(() => {
    if (!dailyVisitsData.length) return 1;
    return Math.max(1, ...dailyVisitsData.map((d) => d.visits));
  }, [dailyVisitsData]);

  // Gráfico 2: Flujo de nuevos usuarios registrados por día
  const dailyUsersData = useMemo(() => {
    if (!dateSequence.length) return [];
    return groupUsersByDay(users, dateSequence);
  }, [users, dateSequence]);

  const maxUsers = useMemo(() => {
    if (!dailyUsersData.length) return 1;
    return Math.max(1, ...dailyUsersData.map((d) => d.count));
  }, [dailyUsersData]);

  // Gráfico 3: Consultas por categoría sobre el rango seleccionado
  const subjectDistribution = useMemo(() => {
    if (!rangeValidation.isValid) {
      return groupMessagesBySubject([], startDate, endDate);
    }
    return groupMessagesBySubject(messages, startDate, endDate);
  }, [messages, startDate, endDate, rangeValidation.isValid]);

  // Métricas del período y consultas filtradas
  const periodMetrics = useMemo(() => {
    if (!rangeValidation.isValid) {
      return {
        periodVisits: 0,
        periodRegisteredVisits: 0,
        periodUsersCount: 0,
        periodMessagesCount: 0,
        periodPendingMessagesCount: 0,
        filteredMessages: [],
      };
    }
    return calculatePeriodMetrics({
      dailyVisits: analytics.dailyVisits,
      users,
      messages,
      startDate,
      endDate,
    });
  }, [analytics.dailyVisits, users, messages, startDate, endDate, rangeValidation.isValid]);

  // Contadores globales
  const globalPendingCount = useMemo(
    () => messages.filter((m) => m.status === "nueva").length,
    [messages],
  );

  const recentFilteredMessages = useMemo(
    () => periodMetrics.filteredMessages.slice(0, 4),
    [periodMetrics.filteredMessages],
  );

  // Ancho mínimo para scroll horizontal cuando hay muchos días
  const minChartWidth = useMemo(() => {
    const count = dateSequence.length;
    if (count <= 7) return 300;
    return Math.max(300, count * (count > 14 ? 34 : 44));
  }, [dateSequence.length]);

  return (
    <div className="admin-analytics-view">
      {/* 1. Contadores Globales Clave (Requisito 2) */}
      <div className="stats-grid mb-4">
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
          value={users.length}
          detail="Cuentas habilitadas para demos"
          icon="◉"
        />
        <StatCard
          label="Consultas totales"
          value={messages.length}
          detail={`${globalPendingCount} nuevas sin responder`}
          icon="✉"
        />
      </div>

      {/* 2. Filtro de Rango de Fechas (Requisitos 1, 7 y 8) */}
      <article className="admin-panel analytics-filter-panel mb-4" aria-label="Filtro de período de análisis">
        <div className="analytics-filter-controls">
          <div>
            <span className="eyebrow">Filtrar por período</span>
            <h3 className="m-0">Rango de fechas para analíticas</h3>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3">
            {/* Inputs de fecha Desde / Hasta */}
            <div className="analytics-date-inputs">
              <div className="analytics-date-field">
                <label htmlFor="analytics-date-start">Desde:</label>
                <input
                  id="analytics-date-start"
                  type="date"
                  value={startDate}
                  max={endDate || today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-control form-control-sm"
                  aria-label="Fecha de inicio"
                />
              </div>

              <div className="analytics-date-field">
                <label htmlFor="analytics-date-end">Hasta:</label>
                <input
                  id="analytics-date-end"
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-control form-control-sm"
                  aria-label="Fecha de fin"
                />
              </div>
            </div>

            {/* Botones de selección rápida */}
            <div className="analytics-preset-buttons" role="group" aria-label="Rangos rápidos predefinidos">
              <button
                type="button"
                className={`btn btn-sm analytics-preset-btn ${
                  activePreset === "7d" ? "btn-primary-custom" : "btn-outline-custom"
                }`}
                onClick={handlePreset7Days}
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                className={`btn btn-sm analytics-preset-btn ${
                  activePreset === "30d" ? "btn-primary-custom" : "btn-outline-custom"
                }`}
                onClick={handlePreset30Days}
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                className={`btn btn-sm analytics-preset-btn ${
                  activePreset === "all" ? "btn-primary-custom" : "btn-outline-custom"
                }`}
                onClick={handlePresetAllHistory}
              >
                Todo el historial
              </button>
            </div>
          </div>
        </div>

        {/* Validación de error de rango */}
        {!rangeValidation.isValid && (
          <div className="alert alert-warning py-2 px-3 mt-3 mb-0" role="alert">
            {rangeValidation.error}
          </div>
        )}
      </article>

      {/* 3. Tarjetas del Período (Requisito 2) */}
      <div className="mb-4">
        <span className="eyebrow mb-2">Métricas en el período seleccionado ({startDate || "·"} a {endDate || "·"})</span>
        <div className="stats-grid stats-grid-period">
          <StatCard
            label="Visitas del período"
            value={periodMetrics.periodVisits}
            detail={`${periodMetrics.periodRegisteredVisits} de usuarios registrados`}
            icon="↗"
          />
          <StatCard
            label="Nuevas cuentas"
            value={periodMetrics.periodUsersCount}
            detail="Usuarios registrados en el rango"
            icon="◉"
          />
          <StatCard
            label="Consultas del período"
            value={periodMetrics.periodMessagesCount}
            detail={`${periodMetrics.periodPendingMessagesCount} pendientes de respuesta`}
            icon="✉"
          />
        </div>
      </div>

      {/* 4. Gráficos Temporales: Fila 1 (Visitas y Flujo de Registros) */}
      <div className="row g-4 mb-4">
        {/* Gráfico 1: Tráfico y Accesos Diarios (Requisito 3 y 6) */}
        <div className="col-lg-6">
          <article className="admin-panel chart-panel h-100 d-flex flex-column">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Tráfico y accesos</span>
                <h3>Visitas diarias (totales vs registradas)</h3>
              </div>
              <div className="chart-legend">
                <span><i className="legend-total" /> Visitas generales</span>
                <span><i className="legend-registered" /> Autenticadas</span>
              </div>
            </div>

            {!rangeValidation.isValid ? (
              <div className="chart-empty-state my-auto">
                <span className="chart-empty-icon" aria-hidden="true">⚠</span>
                <p>Rango de fechas no válido.</p>
              </div>
            ) : periodMetrics.periodVisits === 0 ? (
              <div className="chart-empty-state my-auto">
                <span className="chart-empty-icon" aria-hidden="true">↗</span>
                <p>No se registraron visitas en el período seleccionado.</p>
              </div>
            ) : (
              <div className="chart-scrollable">
                <div
                  className="chart-bars"
                  role="img"
                  aria-label="Gráfico de visitas diarias"
                  style={{ minWidth: `${minChartWidth}px` }}
                >
                  {dailyVisitsData.map((day) => (
                    <div
                      className="chart-day chart-bar-interactive"
                      key={day.date}
                      tabIndex={0}
                      role="graphics-symbol"
                      aria-label={`${day.fullLabel}: ${day.visits} visitas (${day.registered} autenticadas)`}
                    >
                      <div className="chart-tooltip" role="tooltip" aria-hidden="true">
                        <strong>{day.fullLabel}</strong>
                        <span>{day.visits} visitas ({day.registered} registradas)</span>
                      </div>
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
              </div>
            )}

            <p className="chart-footnote mt-auto pt-2 mb-0">
              Usa el cursor o teclado para inspeccionar cada barra del período.
            </p>
          </article>
        </div>

        {/* Gráfico 2: Flujo de Registros de Usuarios (Requisito 5 y 6) */}
        <div className="col-lg-6">
          <article className="admin-panel chart-panel h-100 d-flex flex-column">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Crecimiento de comunidad</span>
                <h3>Flujo de registros de usuarios</h3>
              </div>
              <div className="chart-legend">
                <span><i className="legend-users" /> Cuentas creadas</span>
              </div>
            </div>

            {!rangeValidation.isValid ? (
              <div className="chart-empty-state my-auto">
                <span className="chart-empty-icon" aria-hidden="true">⚠</span>
                <p>Rango de fechas no válido.</p>
              </div>
            ) : periodMetrics.periodUsersCount === 0 ? (
              <div className="chart-empty-state my-auto">
                <span className="chart-empty-icon" aria-hidden="true">◉</span>
                <p>No hubo nuevos registros de usuarios en este período.</p>
              </div>
            ) : (
              <div className="chart-scrollable">
                <div
                  className="chart-bars"
                  role="img"
                  aria-label="Gráfico de flujo de registros de usuarios"
                  style={{ minWidth: `${minChartWidth}px` }}
                >
                  {dailyUsersData.map((day) => (
                    <div
                      className="chart-day chart-bar-interactive"
                      key={day.date}
                      tabIndex={0}
                      role="graphics-symbol"
                      aria-label={`${day.fullLabel}: ${day.count} nuevos usuarios registrados`}
                    >
                      <div className="chart-tooltip" role="tooltip" aria-hidden="true">
                        <strong>{day.fullLabel}</strong>
                        <span>{day.count} {day.count === 1 ? "nuevo usuario" : "nuevos usuarios"}</span>
                      </div>
                      <span className="chart-value">{day.count || "·"}</span>
                      <div className="chart-bar-track">
                        <span
                          className="chart-bar-users"
                          style={{ height: `${Math.max(4, (day.count / maxUsers) * 100)}%` }}
                        />
                      </div>
                      <span className="chart-day-label">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="chart-footnote mt-auto pt-2 mb-0">
              Registros ordenados por hora local (Argentina, UTC-3).
            </p>
          </article>
        </div>
      </div>

      {/* 5. Gráficos Categóricos y Entradas Recientes: Fila 2 */}
      <div className="row g-4">
        {/* Gráfico 3: Consultas por Categoría (Requisito 4) */}
        <div className="col-lg-6">
          <article className="admin-panel chart-panel h-100 d-flex flex-column">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Consultas por categoría</span>
                <h3>Tipos de solicitudes en el período</h3>
              </div>
            </div>

            {!rangeValidation.isValid ? (
              <div className="chart-empty-state my-auto">
                <span className="chart-empty-icon" aria-hidden="true">⚠</span>
                <p>Rango de fechas no válido.</p>
              </div>
            ) : periodMetrics.periodMessagesCount === 0 ? (
              <div className="chart-empty-state my-auto">
                <span className="chart-empty-icon" aria-hidden="true">✉</span>
                <p>No se recibieron consultas en este período.</p>
              </div>
            ) : (
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
                        aria-label={`${item.type}: ${item.count} consultas (${item.pct}%)`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="chart-footnote mt-auto mb-0">
              Distribución parametrizada calculada exclusivamente para el período seleccionado.
            </p>
          </article>
        </div>

        {/* Consultas recientes en el período */}
        <div className="col-lg-6">
          <article className="admin-panel h-100 d-flex flex-column">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Entrada reciente del período</span>
                <h3>Últimas consultas recibidas</h3>
              </div>
              <button className="text-link" type="button" onClick={() => setTab("consultas")}>
                Ver todas en detalle →
              </button>
            </div>

            {recentFilteredMessages.length ? (
              <div className="admin-list flex-grow-1">
                {recentFilteredMessages.map((msg) => (
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
              <div className="chart-empty-state my-auto">
                <span className="chart-empty-icon" aria-hidden="true">✉</span>
                <p>No se recibieron consultas en el rango seleccionado.</p>
              </div>
            )}

            <p className="chart-footnote mt-auto mb-0">
              Mostrando hasta 4 consultas recientes correspondientes al período activo.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
