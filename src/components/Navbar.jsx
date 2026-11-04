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

export default function Navbar({ user, onLogin, onLogout, onOperator, onCustomerMessages }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();

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
            className={`online-badge ${isOnline ? "online" : "offline"}`}
            title={isOnline ? "La conexión del dispositivo parece activa" : "Sin conexión de red"}
            aria-label={isOnline ? "Conectado" : "Sin conexión"}
          >
            <span className="dot" />
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
                className={`online-badge ${isOnline ? "online" : "offline"}`}
                title={isOnline ? "La conexión del dispositivo parece activa" : "Sin conexión de red"}
              >
                <span className="dot" />
                <span className="badge-text">{isOnline ? "Conectado" : "Sin conexión"}</span>
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
