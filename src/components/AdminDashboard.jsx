import { useEffect, useState } from "react";
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

export default function AdminDashboard({ onExit, initialTab = "resumen" }) {
  const {
    portfolio,
    user,
    storageError,
    saveEntity,
    deleteEntity,
    setMessageStatus,
    replyToMessage,
    refreshPortfolio,
    loading,
    updateUserProfile,
    invitePortfolioUser,
    deletePortfolioUser,
    setUserActive,
  } = usePortfolio();

  const [tab, setTab] = useState(initialTab);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const pendingMessages = portfolio.messages.filter((m) => m.status === "nueva").length;

  async function handleRefresh() {
    try {
      await refreshPortfolio();
      setNotice("Bandejas y datos actualizados.");
    } catch (error) {
      console.error("No se pudo actualizar el panel administrativo.", error);
      setNotice("No se pudo actualizar el panel. Comprueba la conexión e inténtalo otra vez.");
    }
  }

  return (
    <main id="operador" className="admin-page">
      <div className="container">
        <header className="admin-hero">
          <div>
            <a className="text-link admin-back-link" href="#inicio" onClick={onExit}>
              <span aria-hidden="true">←</span> Volver al portfolio público
            </a>
            <span className="eyebrow">Espacio privado · Administración</span>
            <h1>Panel del equipo</h1>
            <p>
              Gestiona consultas, cuentas y contenido desde un único lugar.
            </p>
          </div>
          <div className="admin-hero-actions">
            <button
              className="btn btn-outline-custom btn-sm"
              type="button"
              onClick={() => void handleRefresh()}
              disabled={loading}
            >
              {loading ? "Actualizando…" : "↻ Actualizar"}
            </button>
            <button
              className="btn btn-primary-custom btn-sm"
              type="button"
              onClick={() => { setTab("consultas"); setNotice(""); }}
            >
              <svg
                className="admin-notification-icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Notificaciones
              {pendingMessages > 0 && (
                <span className="tab-count">{pendingMessages}</span>
              )}
            </button>
          </div>
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

        {storageError && <p className="alert alert-danger mt-3" role="alert">{storageError}</p>}
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
              replyToMessage={replyToMessage}
              refreshPortfolio={refreshPortfolio}
              loading={loading}
              setNotice={setNotice}
            />
          )}
          {tab === "usuarios" && (
            <UsersManager
              portfolio={portfolio}
              currentUserId={user?.id}
              updateUserProfile={updateUserProfile}
              invitePortfolioUser={invitePortfolioUser}
              deletePortfolioUser={deletePortfolioUser}
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
