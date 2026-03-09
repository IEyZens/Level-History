import { useCallback, useEffect, useRef, useState } from "react";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../api/events";
import { useAutoResize } from "../hooks/useAutoResize";

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Labels affichés pour chaque catégorie d'événement */
const EVENT_CATEGORIES = {
  OTHER: "Other",
  CONSOLE_RELEASE: "Console",
  GAME_RELEASE: "Games",
  COMPANY_FOUNDING: "Companies",
  TECHNOLOGY: "Technology",
  CULTURAL_IMPACT: "Culture",
};

/** Couleurs de fond des badges de catégorie */
const CATEGORY_BADGE_COLORS = {
  CONSOLE_RELEASE: "#e8f0fe",
  GAME_RELEASE: "#e6f4ea",
  COMPANY_FOUNDING: "#fce8e6",
  TECHNOLOGY: "#fef7e0",
  CULTURAL_IMPACT: "#f3e8fd",
  OTHER: "#f1f3f4",
};

/** État initial du formulaire */
const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  image: "",
  category: "OTHER",
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

/**
 * Conteneur de champ de formulaire avec label et hint optionnel
 * @param {{ label: string, hint?: string, children: React.ReactNode }} props
 */
function FormField({ label, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="admin-field-hint">{hint}</span>}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * Panneau d'administration des événements — CRUD complet
 * Affiche un formulaire de création/édition et la liste de tous les événements
 * @param {{ onCountChange?: Function }} props - Callback appelé avec le nombre d'événements
 */
export default function AdminEvents({ onCountChange }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editing, setEditing] = useState(null); // Événement en cours d'édition ou null
  const [fields, setFields] = useState(EMPTY_FORM);

  const textareaRef = useRef(null);
  useAutoResize(textareaRef);

  // ─── Données ───────────────────────────────────────────────────────────────

  /** Charge tous les événements et met à jour le compteur du parent */
  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      onCountChange?.(data.length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Affiche un message de succès pendant 3 secondes */
  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  /** Réinitialise le formulaire et quitte le mode édition */
  function resetForm() {
    setEditing(null);
    setFields(EMPTY_FORM);
  }

  /** Passe en mode édition et pré-remplit le formulaire avec les données de l'événement */
  function startEdit(event) {
    setEditing(event);
    setFields({
      title: event.title,
      description: event.description,
      date: event.date?.slice(0, 10), // Format YYYY-MM-DD pour l'input date
      image: event.image || "",
      category: event.category || "OTHER",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  /** Soumet le formulaire — crée ou met à jour selon le mode actif */
  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      if (editing) {
        await updateEvent(editing.id, fields);
        showSuccess("Event updated successfully.");
        resetForm();
      } else {
        await createEvent(fields);
        showSuccess("Event created successfully.");
        setFields(EMPTY_FORM);
      }
      fetchEvents();
    } catch (e) {
      setError(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  /** Supprime un événement après confirmation */
  async function handleDelete(id) {
    if (!window.confirm("Delete this event? This action is irreversible."))
      return;
    try {
      await deleteEvent(id);
      fetchEvents();
      showSuccess("Event deleted.");
    } catch (e) {
      setError(e.message);
    }
  }

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
          {successMsg}
        </div>
      )}

      <div className="admin-content-grid">
        {/* ── Panneau formulaire ─────────────────────────────────────────────── */}
        <section className="admin-form-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              {editing ? "Edit Event" : "New Event"}
            </h2>
            {editing && (
              <button className="admin-panel-cancel" onClick={resetForm}>
                ✕ Cancel
              </button>
            )}
          </div>

          {/* Badge indiquant l'événement en cours d'édition */}
          {editing && (
            <div className="admin-editing-badge">
              Editing: <strong>{editing.title}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <FormField label="Title">
              <input
                className="form-input"
                placeholder="e.g. Launch of the PlayStation"
                value={fields.title}
                required
                onChange={(e) =>
                  setFields((f) => ({ ...f, title: e.target.value }))
                }
              />
            </FormField>

            <FormField label="Description">
              {/* Textarea à hauteur automatique via useAutoResize */}
              <textarea
                ref={textareaRef}
                className="form-input"
                rows="4"
                placeholder="Describe this event..."
                required
                value={fields.description}
                onChange={(e) =>
                  setFields((f) => ({ ...f, description: e.target.value }))
                }
              />
            </FormField>

            <div className="admin-form-row">
              <FormField label="Date">
                <input
                  type="date"
                  className="form-input"
                  value={fields.date}
                  required
                  onChange={(e) =>
                    setFields((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Category">
                <select
                  className="form-input"
                  value={fields.category}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {Object.entries(EVENT_CATEGORIES).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Image URL"
              hint="Paste a direct image URL (jpg, png, webp)"
            >
              <input
                className="form-input"
                placeholder="https://..."
                value={fields.image}
                onChange={(e) =>
                  setFields((f) => ({ ...f, image: e.target.value }))
                }
              />
            </FormField>

            {/* Aperçu de l'image si une URL est saisie */}
            {fields.image && (
              <div className="admin-image-preview">
                <img
                  src={fields.image}
                  alt="Preview"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            <div className="admin-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Event"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── Panneau liste ──────────────────────────────────────────────────── */}
        <section className="admin-list-panel">
          <div className="admin-section-header">
            <h2 className="admin-section-title">All Events</h2>
            <span className="admin-count-badge">{events.length}</span>
          </div>

          {loading ? (
            <div className="admin-loading">Loading...</div>
          ) : events.length === 0 ? (
            <div className="admin-empty">
              No events yet. Create your first one.
            </div>
          ) : (
            <div className="admin-list">
              {events.map((event) => (
                <div
                  key={event.id}
                  // Surligne l'item en cours d'édition
                  className={`admin-list-item ${editing?.id === event.id ? "admin-list-item--editing" : ""}`}
                >
                  <div className="admin-list-item-img">
                    {event.image ? (
                      <img src={event.image} alt={event.title} />
                    ) : (
                      <div className="admin-list-item-img-placeholder">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="admin-list-item-info">
                    <p className="admin-list-item-title">{event.title}</p>
                    <div className="admin-list-item-meta">
                      <span>
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        className="admin-category-pill"
                        style={{
                          background:
                            CATEGORY_BADGE_COLORS[event.category] || "#f1f3f4",
                        }}
                      >
                        {EVENT_CATEGORIES[event.category] || event.category}
                      </span>
                    </div>
                  </div>

                  <div className="admin-list-item-actions">
                    <button
                      onClick={() => startEdit(event)}
                      className="admin-action-btn admin-action-btn--edit"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="admin-action-btn admin-action-btn--delete"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
