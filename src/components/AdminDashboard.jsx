import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { teamInfo } from "../data/portfolio.js";
import AnalyticsView from "./admin/AnalyticsView.jsx";
import ContentCrud from "./admin/ContentCrud.jsx";
import MessagesManager from "./admin/MessagesManager.jsx";
import UsersManager from "./admin/UsersManager.jsx";

const TABS = [
  ["resumen", "Métricas & Gráficos", "◧"],
  ["proyectos", "Proyectos", "↗"],
  ["demos", "Demos", "◉"],
  ["servicios", "Servicios", "✳"],
  ["consultas", "Consultas", "✉"],
  ["usuarios", "Usuarios", "◎"],
];

export default function AdminDashboard({ onExit }) {
  const {
    portfolio,
    saveEntity,
    deleteEntity,
    setMessageStatus,
    setUserActive,
  } = usePortfolio();

  const [tab, setTab] = useState("resumen");
  const [notice, setNotice] = useState("");

  const pendingMessages = portfolio.messages.filter((m) => m.status === "nueva").length;

  return (
    <main id="operador" className="admin-page">
      <div className="container">
        <header className="admin-hero">
          <div>
            <a className="text-link admin-back-link" href="#inicio" onClick={onExit}>
              <span aria-hidden="true">←</span> Volver al portfolio público
            </a>
            <span className="eyebrow">Panel de Operador · Supabase PostgreSQL</span>
            <h1>Control y Gestión Integrador</h1>
            <p>
              Administra contenidos, usuarios con acceso a demos, métricas de visitas y respuestas a consultas.
            </p>
          </div>
          <span className="local-badge"><span /> Operador Autorizado (JWT verificado)</span>
        </header>

        <nav className="admin-tabs" aria-label="Secciones del panel de administración">
          {TABS.map(([value, label, icon]) => (
            <button
              key={value}
              className={`admin-tab${tab === value ? " active" : ""}`}
              type="button"
              aria-pressed={tab === value}
              onClick={() => { setTab(value); setNotice(""); }}
            >
              <span aria-hidden="true">{icon}</span> {label}
              {value === "consultas" && pendingMessages > 0 && (
                <span className="tab-count">{pendingMessages}</span>
              )}
            </button>
          ))}
        </nav>

        {notice && <p className="admin-notice" role="status">{notice}</p>}

        <div className="admin-content mt-3">
          {tab === "resumen" && <AnalyticsView portfolio={portfolio} setTab={setTab} />}
          {tab === "proyectos" && (
            <ContentCrud
              kind="projects"
              portfolio={portfolio}
              saveEntity={saveEntity}
              deleteEntity={deleteEntity}
              setNotice={setNotice}
            />
          )}
          {tab === "demos" && (
            <ContentCrud
              kind="demos"
              portfolio={portfolio}
              saveEntity={saveEntity}
              deleteEntity={deleteEntity}
              setNotice={setNotice}
            />
          )}
          {tab === "servicios" && (
            <ContentCrud
              kind="services"
              portfolio={portfolio}
              saveEntity={saveEntity}
              deleteEntity={deleteEntity}
              setNotice={setNotice}
            />
          )}
          {tab === "consultas" && (
            <MessagesManager
              portfolio={portfolio}
              setMessageStatus={setMessageStatus}
              setNotice={setNotice}
            />
          )}
          {tab === "usuarios" && (
            <UsersManager
              portfolio={portfolio}
              setUserActive={setUserActive}
              setNotice={setNotice}
            />
          )}
        </div>

        <footer className="admin-private-note mt-4 text-center">
          <small className="text-muted">
            {teamInfo.name} · Panel administrativo conectado a Supabase Auth y PostgreSQL RLS.
          </small>
        </footer>
      </div>
    </main>
  );
}
