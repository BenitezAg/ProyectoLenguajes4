import { useState } from "react";
import { createId } from "../../utils/records.js";

const PROJECT_COLORS = ["pink", "yellow", "cyan", "green", "purple", "blue"];
const DEMO_KINDS = ["shop", "brand", "habits", "dashboard", "gallery", "arcade"];

function isUrlField(field) {
  return (
    field.type === "url" ||
    field.url === true ||
    /(?:url|link|href)$/i.test(field.key)
  );
}

function validateField(field, value) {
  const text = String(value ?? "");
  const trimmed = text.trim();
  const minLength =
    field.minLength ??
    (field.multiline ? 5 : ["title", "name"].includes(field.key) ? 2 : undefined);

  if (field.required && !trimmed) return "Este campo es obligatorio.";
  if (minLength && trimmed.length < minLength) {
    return `Debe tener al menos ${minLength} caracteres.`;
  }
  if (field.maxLength && text.length > field.maxLength) {
    return `No puede superar los ${field.maxLength} caracteres.`;
  }

  if (isUrlField(field) && trimmed) {
    try {
      const url = new URL(trimmed);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
        return "Ingresá una URL válida que use http:// o https://.";
      }
    } catch {
      return "Ingresá una URL válida que use http:// o https://.";
    }
  }

  return "";
}

export default function ContentCrud({
  kind,
  portfolio,
  saveEntity,
  deleteEntity,
  setNotice,
}) {
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const collections = {
    projects: {
      label: "proyecto",
      values: portfolio.projects,
      fields: [
        { key: "title", label: "Nombre del proyecto", required: true, maxLength: 80 },
        { key: "emoji", label: "Emoji / Icono", required: true, maxLength: 8 },
        { key: "category", label: "Categoría", options: ["web", "diseno", "app"] },
        { key: "color", label: "Color temático", options: PROJECT_COLORS },
        { key: "description", label: "Descripción", required: true, maxLength: 300, multiline: true },
        { key: "technologies", label: "Tecnologías utilizadas", required: true, maxLength: 140 },
      ],
      makeNew: () => ({
        id: "",
        title: "",
        emoji: "✧",
        category: "web",
        color: "green",
        description: "",
        technologies: "",
      }),
    },
    services: {
      label: "servicio",
      values: portfolio.services,
      fields: [
        { key: "title", label: "Nombre del servicio", required: true, maxLength: 80 },
        { key: "icon", label: "Icono", required: true, maxLength: 8 },
        { key: "description", label: "Descripción detallada", required: true, maxLength: 300, multiline: true },
      ],
      makeNew: () => ({ id: "", icon: "✳", title: "", description: "" }),
    },
    demos: {
      label: "demo",
      values: portfolio.demos,
      fields: [
        { key: "name", label: "Nombre de la demo", required: true, maxLength: 80 },
        {
          key: "projectId",
          label: "Proyecto asociado",
          options: portfolio.projects.map((p) => p.id),
          optionLabels: portfolio.projects.map((p) => p.title),
        },
        { key: "kind", label: "Tipo interactivo", options: DEMO_KINDS },
        { key: "description", label: "Descripción de interacción", required: true, maxLength: 240, multiline: true },
      ],
      makeNew: () => ({
        id: "",
        projectId: portfolio.projects[0]?.id ?? "",
        kind: "shop",
        name: "",
        description: "",
      }),
    },
  };

  const collection = collections[kind];
  const editing =
    editingId === "nueva"
      ? collection.makeNew()
      : collection.values.find((item) => item.id === editingId);

  async function handleSave(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData);
    const nextFieldErrors = Object.fromEntries(
      collection.fields
        .map((field) => [field.key, validateField(field, formValues[field.key])])
        .filter(([, message]) => message),
    );
    setFieldErrors(nextFieldErrors);
    setError("");
    if (Object.keys(nextFieldErrors).length) return;

    const itemData = {
      id: editing.id || createId(kind),
      ...formValues,
    };

    try {
      await saveEntity(kind, itemData);
      setNotice(`Se guardó el ${collection.label} con éxito en Supabase.`);
      setEditingId(null);
      setError("");
      setFieldErrors({});
    } catch (saveError) {
      console.error(`Error guardando ${collection.label}:`, saveError);
      setError("No se pudieron persistir los cambios en la base de datos.");
    }
  }

  async function handleDelete(item) {
    const title = item.title ?? item.name;
    if (!window.confirm(`¿Seguro que deseas eliminar "${title}"?`)) return;

    try {
      await deleteEntity(kind, item.id);
      setNotice(`${collection.label.toUpperCase()} eliminado correctamente.`);
    } catch (deleteError) {
      console.error(`Error eliminando ${collection.label}:`, deleteError);
      setError("No se pudo eliminar el elemento.");
    }
  }

  if (editing) {
    return (
      <form className="admin-panel editor-panel" noValidate onSubmit={handleSave}>
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">Gestión de contenido</span>
            <h3>{editing.id ? `Editar ${collection.label}` : `Nuevo ${collection.label}`}</h3>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Cerrar edición"
            onClick={() => { setEditingId(null); setError(""); setFieldErrors({}); }}
          >
            ×
          </button>
        </div>

        <div className="editor-fields">
          {collection.fields.map((field) => {
            const fieldId = `content-${kind}-${field.key}`;
            const errorId = `${fieldId}-error`;
            const fieldError = fieldErrors[field.key];
            const controlProps = {
              id: fieldId,
              "aria-describedby": fieldError ? errorId : undefined,
              "aria-invalid": fieldError ? "true" : undefined,
              onChange: (event) => {
                if (!fieldErrors[field.key]) return;
                const message = validateField(field, event.currentTarget.value);
                setFieldErrors((current) => {
                  if (message) return { ...current, [field.key]: message };
                  const next = { ...current };
                  delete next[field.key];
                  return next;
                });
              },
            };

            return (
              <div className="admin-field" key={field.key}>
                <label htmlFor={fieldId}>
                  {field.label} {field.required && "*"}
                </label>
                {field.options ? (
                  <select
                    className="form-select"
                    defaultValue={editing[field.key] || field.options[0] || ""}
                    disabled={!field.options.length}
                    name={field.key}
                    required={field.required}
                    {...controlProps}
                  >
                    {field.options.map((opt, i) => (
                      <option key={opt} value={opt}>
                        {field.optionLabels?.[i] ?? opt}
                      </option>
                    ))}
                  </select>
                ) : field.multiline ? (
                  <textarea
                    className="form-control"
                    defaultValue={editing[field.key]}
                    maxLength={field.maxLength}
                    minLength={field.minLength ?? 5}
                    name={field.key}
                    required={field.required}
                    rows={3}
                    {...controlProps}
                  />
                ) : (
                  <input
                    className="form-control"
                    defaultValue={editing[field.key]}
                    maxLength={field.maxLength}
                    minLength={field.minLength ?? (["title", "name"].includes(field.key) ? 2 : undefined)}
                    name={field.key}
                    required={field.required}
                    type={isUrlField(field) ? "url" : "text"}
                    {...controlProps}
                  />
                )}
                {fieldError && (
                  <span className="text-danger d-block" id={errorId} role="alert">
                    {fieldError}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="alert alert-danger" role="alert">{error}</p>}

        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className="btn btn-primary-custom" type="submit">Guardar cambios</button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => { setEditingId(null); setFieldErrors({}); }}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="eyebrow">CRUD de Contenido</span>
          <h3>{collection.label.toUpperCase()}S ({collection.values.length})</h3>
        </div>
        <button
          className="btn btn-primary-custom btn-sm"
          type="button"
          disabled={kind === "demos" && portfolio.projects.length === 0}
          onClick={() => { setFieldErrors({}); setEditingId("nueva"); }}
        >
          + Agregar {collection.label}
        </button>
      </div>

      {error && <p className="alert alert-danger" role="alert">{error}</p>}

      {collection.values.length ? (
        <div className="manage-list">
          {collection.values.map((item) => {
            const projectName =
              kind === "demos"
                ? portfolio.projects.find((p) => p.id === item.projectId)?.title
                : null;
            return (
              <div className="manage-row" key={item.id}>
                <span className="manage-emoji" aria-hidden="true">
                  {kind === "projects" ? item.emoji : kind === "services" ? item.icon : "◉"}
                </span>
                <div className="admin-list-main">
                  <strong>{item.title ?? item.name}</strong>
                  <span>
                    {kind === "demos"
                      ? `${projectName ?? "Sin proyecto"} · ${item.kind}`
                      : kind === "projects"
                        ? item.technologies
                        : item.description}
                  </span>
                </div>
                <div className="manage-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => { setFieldErrors({}); setEditingId(item.id); }}
                  >
                    Editar
                  </button>
                  <button className="btn btn-danger-ghost btn-sm" type="button" onClick={() => handleDelete(item)}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">No hay registros de {collection.label}. Crea el primero.</p>
      )}
    </article>
  );
}
