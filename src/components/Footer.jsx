import { teamInfo, teamMembers } from "../data/portfolio.js";

export default function Footer({ isOperator = false, onOperator }) {
  return (
    <footer className="portfolio-footer">
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <a className="brand-mark footer-mark" href="#inicio" aria-label="Volver al inicio">
            L4<span>.</span>
          </a>
          <span className="footer-team-sub">
            {teamInfo.name} · {teamMembers.length} Integrantes
          </span>
        </div>
        <p className="m-0 footer-copy">
          © {new Date().getFullYear()} {teamInfo.name} · React 19, Supabase RLS & Bootstrap 5.
        </p>
        <div className="footer-links">
          <a href="#inicio">Volver arriba ↑</a>
          {isOperator && (
            <a href="#operador" onClick={onOperator} className="footer-operator-link">
              Panel del operador ⚙
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
