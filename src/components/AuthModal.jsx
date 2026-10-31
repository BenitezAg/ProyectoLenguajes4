import { useEffect, useState } from "react";

export default function AuthModal({ onClose, onLogin, onRegister, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
    setForm({ name: "", email: "", password: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        const result = await onRegister(form);
        if (result.emailConfirmationRequired) {
          setNotice("Te enviamos un correo para confirmar tu cuenta. Después podrás iniciar sesión con tu nueva contraseña.");
          setMode("login");
          setForm((current) => ({ ...current, password: "" }));
          return;
        }
      } else {
        await onLogin(form);
      }
      onClose();
    } catch (submitError) {
      console.error("No se pudo completar el acceso.", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo completar la solicitud. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop-custom auth-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Cerrar"
          disabled={submitting}
          onClick={onClose}
        >
          ×
        </button>
        <span className="eyebrow">Acceso a proyectos y demos</span>
        <h2 id="auth-title">{mode === "register" ? "Únete al portfolio." : "Qué bueno verte."}</h2>
        <p className="section-description">
          {mode === "register"
            ? "Crea tu cuenta gratuita para explorar los proyectos y sus experiencias interactivas."
            : "Inicia sesión con tu cuenta segura de Supabase."}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Nombre
              <input
                autoComplete="name"
                maxLength={70}
                minLength={2}
                name="name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
          )}
          {notice && <p className="alert alert-success mb-0" role="status">{notice}</p>}
          <label>
            Correo electrónico
            <input
              autoComplete="email"
              maxLength={254}
              name="email"
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Contraseña
            <input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              maxLength={128}
              minLength={10}
              name="password"
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            {mode === "register" && (
              <span className="input-hint">Utiliza al menos 10 caracteres.</span>
            )}
          </label>
          {error && <p className="alert alert-danger mb-0" role="alert">{error}</p>}
          <button className="btn btn-primary-custom w-100" type="submit" disabled={submitting}>
            {submitting ? "Verificando…" : mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "register" ? "¿Ya tienes una cuenta?" : "¿Primera vez por aquí?"}{" "}
          <button
            type="button"
            disabled={submitting}
            onClick={() => changeMode(mode === "register" ? "login" : "register")}
          >
            {mode === "register" ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </section>
    </div>
  );
}
