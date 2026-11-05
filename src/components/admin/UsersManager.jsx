import { useState } from "react";
import { formatDate } from "../../utils/records.js";
import { validateProfileDetails } from "../../utils/profile.js";

export default function UsersManager({
  portfolio,
  currentUserId,
  invitePortfolioUser,
  deletePortfolioUser,
  updateUserProfile,
  setUserActive,
  setNotice,
}) {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [editingUserId, setEditingUserId] = useState("");
  const [editingProfile, setEditingProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [savingUserId, setSavingUserId] = useState("");

  const filteredUsers = portfolio.users.filter((user) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.phone.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  async function handleInvite(event) {
    event.preventDefault();
    setNotice("");
    const firstName = inviteFirstName.trim();
    const lastName = inviteLastName.trim();
    const phone = invitePhone.trim();
    const email = inviteEmail.trim().toLowerCase();
    try {
      validateProfileDetails({ firstName, lastName, phone });
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setInviting(true);
    try {
      await invitePortfolioUser({ firstName, lastName, phone, email });
      setNotice(`Se generó una invitación para ${email}.`);
      setInviteFirstName("");
      setInviteLastName("");
      setInvitePhone("");
      setInviteEmail("");
      setError("");
    } catch (inviteError) {
      console.error("Error al invitar al usuario:", inviteError);
      setError("No se pudo crear la invitación. Verifica si el correo ya tiene una cuenta.");
    } finally {
      setInviting(false);
    }
  }

  async function handleToggleUser(user) {
    setNotice("");
    setSavingUserId(user.id);
    try {
      await setUserActive(user.id, !user.active);
      setNotice(
        `La cuenta de ${user.name} ahora está ${!user.active ? "activa" : "desactivada"}.`
      );
      setError("");
    } catch (err) {
      console.error("Error al actualizar estado de usuario:", err);
      setError("No se pudo actualizar el estado de la cuenta.");
    } finally {
      setSavingUserId("");
    }
  }

  async function handleSaveName(event, user) {
    event.preventDefault();
    setNotice("");
    const profile = {
      firstName: editingProfile.firstName.trim(),
      lastName: editingProfile.lastName.trim(),
      phone: editingProfile.phone.trim(),
    };
    try {
      validateProfileDetails(profile, { requirePhone: false });
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setSavingUserId(user.id);
    try {
      await updateUserProfile(user.id, profile);
      setNotice(`Se actualizó el nombre de la cuenta de ${user.name}.`);
      setEditingUserId("");
      setEditingProfile({ firstName: "", lastName: "", phone: "" });
      setError("");
    } catch (updateError) {
      console.error("Error al actualizar el perfil del usuario:", updateError);
      setError("No se pudo guardar el nombre del usuario.");
    } finally {
      setSavingUserId("");
    }
  }

  async function handleDeleteUser(user) {
    const confirmed = window.confirm(
      `¿Eliminar la cuenta de ${user.name} (${user.email})? No podrá volver a iniciar sesión. Sus consultas se conservarán.`,
    );
    if (!confirmed) return;

    setNotice("");
    setSavingUserId(user.id);
    try {
      await deletePortfolioUser(user.id);
      setNotice(`Se eliminó la cuenta de ${user.name}.`);
      setError("");
    } catch (deleteError) {
      console.error("Error al eliminar la cuenta:", deleteError);
      setError("No se pudo eliminar la cuenta. Las cuentas de operadores no pueden eliminarse desde aquí.");
    } finally {
      setSavingUserId("");
    }
  }

  return (
    <article className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="eyebrow">Control de acceso a proyectos y demos</span>
          <h3>Usuarios y accesos ({portfolio.users.length})</h3>
        </div>
      </div>

      <form className="user-invite-form mb-3" onSubmit={(event) => void handleInvite(event)}>
        <label>
          Nombre
          <input
            autoComplete="name"
            className="form-control form-control-sm"
            maxLength={70}
            minLength={2}
            onChange={(event) => setInviteFirstName(event.target.value)}
            required
            value={inviteFirstName}
          />
        </label>
        <label>
          Apellido
          <input
            autoComplete="family-name"
            className="form-control form-control-sm"
            maxLength={70}
            minLength={2}
            onChange={(event) => setInviteLastName(event.target.value)}
            required
            value={inviteLastName}
          />
        </label>
        <label>
          Teléfono
          <input
            autoComplete="tel"
            className="form-control form-control-sm"
            maxLength={30}
            minLength={8}
            onChange={(event) => setInvitePhone(event.target.value)}
            pattern="[0-9+(). -]{8,30}"
            placeholder="+54 9 11 1234-5678"
            required
            type="tel"
            value={invitePhone}
          />
        </label>
        <label>
          Correo electrónico
          <input
            autoComplete="email"
            className="form-control form-control-sm"
            maxLength={254}
            onChange={(event) => setInviteEmail(event.target.value)}
            required
            type="email"
            value={inviteEmail}
          />
        </label>
        <button className="btn btn-primary-custom btn-sm" type="submit" disabled={inviting}>
          {inviting ? "Enviando…" : "Invitar usuario"}
        </button>
      </form>

      <div className="row g-2 mb-3">
        <div className="col-sm-6">
          <label className="visually-hidden" htmlFor="admin-user-search">
            Buscar por nombre o correo
          </label>
          <input
            className="form-control form-control-sm"
            id="admin-user-search"
            type="search"
            placeholder="Buscar usuario por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <p className="chart-footnote">
        Puedes invitar cuentas, corregir sus nombres, suspender su acceso o eliminar cuentas de clientes. Las cuentas del equipo se administran desde Supabase.
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
                {editingUserId === user.id ? (
                  <form
                    className="user-edit-form"
                    onSubmit={(event) => void handleSaveName(event, user)}
                  >
                    <label className="visually-hidden" htmlFor={`user-name-${user.id}`}>
                      Nombre de {user.email}
                    </label>
                    <input
                      className="form-control form-control-sm"
                      id={`user-name-${user.id}`}
                      maxLength={70}
                      minLength={2}
                      aria-label="Nombre"
                      required
                      value={editingProfile.firstName}
                      onChange={(event) => setEditingProfile({ ...editingProfile, firstName: event.target.value })}
                    />
                    <input
                      className="form-control form-control-sm"
                      maxLength={70}
                      minLength={2}
                      aria-label="Apellido"
                      required
                      value={editingProfile.lastName}
                      onChange={(event) => setEditingProfile({ ...editingProfile, lastName: event.target.value })}
                    />
                    <input
                      className="form-control form-control-sm"
                      maxLength={30}
                      aria-label="Teléfono"
                      pattern="[0-9+(). -]{0,30}"
                      type="tel"
                      value={editingProfile.phone}
                      onChange={(event) => setEditingProfile({ ...editingProfile, phone: event.target.value })}
                    />
                    <button
                      className="btn btn-primary-custom btn-sm"
                      type="submit"
                      disabled={savingUserId === user.id}
                    >
                      {savingUserId === user.id ? "Guardando…" : "Guardar"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => { setEditingUserId(""); setEditingProfile({ firstName: "", lastName: "", phone: "" }); }}
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <strong>{user.name}</strong>
                )}
                <span>
                  {user.email} · {user.phone || "Teléfono no informado"} · Registrado el {formatDate(user.createdAt)} ·{" "}
                  <span className={user.active ? "text-success" : "text-danger"}>
                    {user.active ? "● Activo" : "○ Inactivo"}
                  </span>
                </span>
              </div>
              <div className="manage-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  disabled={savingUserId === user.id || editingUserId === user.id}
                  onClick={() => {
                    setEditingUserId(user.id);
                    setEditingProfile({
                      firstName: user.firstName ?? "",
                      lastName: user.lastName ?? "",
                      phone: user.phone ?? "",
                    });
                    setError("");
                  }}
                >
                  Editar nombre
                </button>
                <button
                  className={`btn btn-sm ${user.active ? "btn-danger-ghost" : "btn-ghost"}`}
                  type="button"
                  disabled={savingUserId === user.id || user.id === currentUserId}
                  title={user.id === currentUserId ? "No puedes suspender tu propia cuenta." : undefined}
                  onClick={() => handleToggleUser(user)}
                >
                  {savingUserId === user.id
                    ? "Actualizando…"
                    : user.active ? "Desactivar acceso" : "Reactivar acceso"}
                </button>
                {user.id !== currentUserId && (
                  <button
                    className="btn btn-danger-ghost btn-sm"
                    type="button"
                    disabled={savingUserId === user.id}
                    onClick={() => void handleDeleteUser(user)}
                  >
                    {savingUserId === user.id ? "Eliminando…" : "Eliminar cuenta"}
                  </button>
                )}
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
