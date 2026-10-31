import { useState } from "react";
import { formatDate } from "../../utils/records.js";

export default function UsersManager({ portfolio, setUserActive, setNotice }) {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredUsers = portfolio.users.filter((user) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  async function handleToggleUser(user) {
    try {
      await setUserActive(user.id, !user.active);
      setNotice(
        `La cuenta de ${user.name} ahora está ${!user.active ? "activa" : "desactivada"}.`
      );
      setError("");
    } catch (err) {
      console.error("Error al actualizar estado de usuario:", err);
      setError("No se pudo actualizar el estado de la cuenta.");
    }
  }

  return (
    <article className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="eyebrow">Control de acceso a proyectos y demos</span>
          <h3>Usuarios Registrados ({portfolio.users.length})</h3>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-sm-6">
          <input
            className="form-control form-control-sm"
            type="search"
            placeholder="Buscar usuario por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <p className="chart-footnote">
        Los usuarios registrados tienen acceso para ver el detalle de proyectos y demos interactivas protegidas por RLS.
      </p>

      {error && <p className="alert alert-danger" role="alert">{error}</p>}

      {filteredUsers.length ? (
        <div className="manage-list">
          {filteredUsers.map((user) => (
            <div className="manage-row" key={user.id}>
              <span className="user-initial" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="admin-list-main">
                <strong>{user.name}</strong>
                <span>
                  {user.email} · Registrado el {formatDate(user.createdAt)} ·{" "}
                  <span className={user.active ? "text-success" : "text-danger"}>
                    {user.active ? "● Activo" : "○ Inactivo"}
                  </span>
                </span>
              </div>
              <div className="manage-actions">
                <button
                  className={`btn btn-sm ${user.active ? "btn-danger-ghost" : "btn-ghost"}`}
                  type="button"
                  onClick={() => handleToggleUser(user)}
                >
                  {user.active ? "Desactivar acceso" : "Reactivar acceso"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">
          {search ? "No se encontraron usuarios con ese criterio." : "Todavía no hay usuarios registrados en el sistema."}
        </p>
      )}
    </article>
  );
}
