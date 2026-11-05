import { useState } from "react";
import { teamInfo } from "../data/portfolio.js";
import { useOnlineStatus } from "../utils/webApis.js";

const links = [
  ["Equipo", "#equipo"],
  ["Servicios", "#servicios"],
  ["Proyectos", "#proyectos"],
  ["Tecnologías", "#tecnologias"],
  ["Contacto", "#contacto"],
];

export default function Navbar({
  user,
  backendConfigured,
  backendReady,
  backendLoading,
  adminUnreadCount = 0,
  onLogin,
  onLogout,
  onOperator,
  onCustomerMessages,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();
  const backendStatus = !backendConfigured
    ? "Vista previa"
    : backendLoading
      ? "Conectando"
      : backendReady
        ? "Base conectada"
        : "Base no disponible";
  const backendStatusClass = backendReady ? "online" : "offline";

  return (
    <nav className="navbar navbar-expand-lg portfolio-nav" aria-label="Navegación principal">
      <div className="container">
        <a
          className="navbar-brand brand-mark d-flex align-items-center gap-2"
          href="#inicio"
          aria-label={`${teamInfo.name}, inicio`}
          onClick={() => setMenuOpen(false)}
        >
          <span>L4</span>
          <span className="brand-dot">·</span>
          <span className="brand-sub">Team</span>
        </a>

        <div className="d-flex align-items-center gap-2 d-lg-none">
          <span
            className={`online-badge ${backendStatusClass}`}
            title={`${backendStatus}. ${isOnline ? "Con conexión de red." : "Sin conexión de red."}`}
            aria-label={backendStatus}
          >
            <span className="dot" />
            <span className="badge-text">{backendStatus}</span>
          </span>
          <button
            className="navbar-toggler nav-toggle"
            type="button"
            aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>

        <div
          id="primary-navigation"
          className={`collapse navbar-collapse${menuOpen ? " show" : ""}`}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            {links.map(([label, href]) => (
              <li className="nav-item" key={href}>
                <a
                  className="nav-link"
                  href={href}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
            {user?.isOperator && (
              <li className="nav-item">
                <a
                  className="nav-link nav-link-operator"
                  href="#operador"
                  onClick={(event) => {
                    onOperator(event);
                    setMenuOpen(false);
                  }}
                >
                  Panel Operador
                </a>
              </li>
            )}
            {user?.isOperator && (
              <li className="nav-item">
                <button
                  className="admin-notification-button"
                  type="button"
                  aria-label={`Notificaciones: ${adminUnreadCount} consultas nuevas`}
                  title="Abrir consultas nuevas"
                  onClick={() => {
                    onOperator(undefined, "consultas");
                    setMenuOpen(false);
                  }}
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
                  <span className="admin-notification-label">Notificaciones</span>
                  {adminUnreadCount > 0 && (
                    <span className="admin-notification-count" aria-hidden="true">
                      {adminUnreadCount > 99 ? "99+" : adminUnreadCount}
                    </span>
                  )}
                </button>
              </li>
            )}
            {user && !user.isOperator && (
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#mis-consultas"
                  onClick={(event) => {
                    event.preventDefault();
                    onCustomerMessages();
                    setMenuOpen(false);
                  }}
                >
                  Mis consultas
                </a>
              </li>
            )}

            <li className="nav-item d-none d-lg-flex align-items-center">
              <span
                className={`online-badge ${backendStatusClass}`}
                title={`${backendStatus}. ${isOnline ? "Con conexión de red." : "Sin conexión de red."}`}
              >
                <span className="dot" />
                <span className="badge-text">{backendStatus}</span>
              </span>
            </li>

            <li className="nav-item mt-2 mt-lg-0">
              {user ? (
                <div className="account-controls">
                  <span className="account-greeting">
                    {user.name.split(" ")[0]}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => {
                    onLogin();
                    setMenuOpen(false);
                  }}
                >
                  Acceder
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
