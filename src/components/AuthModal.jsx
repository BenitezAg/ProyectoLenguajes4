import { useEffect, useState } from "react";

export default function AuthModal({
  onClose,
  onLogin,
  onRegister,
  backendConfigured,
  backendReady,
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
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
    setForm({ firstName: "", lastName: "", phone: "", email: "", password: "" });
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
            : "Inicia sesión con tu cuenta para continuar."}
        </p>
        {!backendConfigured ? (
          <div className="auth-preview-notice">
            <p>
              El inicio de sesión y el registro estarán disponibles cuando la base de datos del portfolio esté conectada.
            </p>
            <button className="btn btn-primary-custom w-100" type="button" onClick={onClose}>
              Volver a la vista previa
            </button>
          </div>
        ) : !backendReady ? (
          <div className="auth-preview-notice">
            <p role="status">
              El acceso y el registro estarán disponibles cuando la conexión con la base de datos se restablezca.
            </p>
            <button className="btn btn-primary-custom w-100" type="button" onClick={onClose}>
              Volver al portfolio
            </button>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Nombre
                  <input
                    autoComplete="name"
                    maxLength={70}
                    minLength={2}
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  />
                </label>
              )}
              {mode === "register" && (
                <label>
                  Apellido
                  <input
                    autoComplete="family-name"
                    maxLength={70}
                    minLength={2}
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  />
                </label>
              )}
              {mode === "register" && (
                <label>
                  Número de teléfono
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={30}
                    minLength={8}
                    name="phone"
                    pattern="[0-9+(). -]{8,30}"
                    placeholder="+54 9 11 1234-5678"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                  <span className="input-hint">Incluye el código de país; no compartiremos este dato públicamente.</span>
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
                  minLength={mode === "register" ? 10 : undefined}
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
          </>
        )}
      </section>
    </div>
  );
}
