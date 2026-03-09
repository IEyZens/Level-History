import { useEffect, useRef, useState } from "react";
import {
  createPersonality,
  deletePersonality,
  getPersonalities,
  updatePersonality,
} from "../api/personalities";
import { useAutoResize } from "../hooks/useAutoResize";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PERSONALITY_CATEGORIES = {
  VISIONARY: "Visionary",
  BUILDER: "Builder",
  EXECUTIVE: "Executive",
};

const PERSONALITY_ROLES = [
  "Game Designer",
  "Programmer",
  "Artist",
  "Composer",
  "Producer",
  "CEO",
  "Co-Founder",
  "Director",
  "Writer",
  "Other",
];

const EMPTY_FORM = {
  name: "",
  role: "",
  biography: "",
  category: "VISIONARY",
  twitter: "",
  linkedin: "",
  website: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormField({ label, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="admin-field-hint">{hint}</span>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPersonalities({ onCountChange }) {
  const [personalities, setPersonalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editing, setEditing] = useState(null);
  const [fields, setFields] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const textareaRef = useRef(null);
  const imageRef = useRef(null);
  useAutoResize(textareaRef);

  // ─── Data ──────────────────────────────────────────────────────────────────

  async function fetchPersonalities() {
    try {
      const data = await getPersonalities();
      setPersonalities(data);
      onCountChange?.(data.length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPersonalities();
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  function resetForm() {
    setEditing(null);
    setFields(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    if (imageRef.current) imageRef.current.value = "";
  }

  function startEdit(p) {
    setEditing(p);
    setFields({
      name: p.name,
      role: p.role || "",
      biography: p.biography || "",
      category: p.category || "VISIONARY",
      twitter: p.twitter || "",
      linkedin: p.linkedin || "",
      website: p.website || "",
    });
    setImageFile(null);
    setImagePreview(p.image ? `${BASE_URL}${p.image}` : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append("image", imageFile);

      if (editing) {
        await updatePersonality(editing.id, formData);
        showSuccess("Personality updated successfully.");
      } else {
        await createPersonality(formData);
        showSuccess("Personality created successfully.");
      }
      resetForm();
      fetchPersonalities();
    } catch (e) {
      setError(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm("Delete this personality? This action is irreversible.")
    )
      return;
    try {
      await deletePersonality(id);
      fetchPersonalities();
      showSuccess("Personality deleted.");
    } catch (e) {
      setError(e.message);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

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
        {/* ── Form panel ─────────────────────────────────────────────────────── */}
        <section className="admin-form-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              {editing ? "Edit Personality" : "New Personality"}
            </h2>
            {editing && (
              <button className="admin-panel-cancel" onClick={resetForm}>
                ✕ Cancel
              </button>
            )}
          </div>

          {editing && (
            <div className="admin-editing-badge">
              Editing: <strong>{editing.name}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-row">
              <FormField label="Name">
                <input
                  className="form-input"
                  placeholder="Full name"
                  value={fields.name}
                  required
                  onChange={(e) =>
                    setFields((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Role">
                <select
                  className="form-input"
                  value={fields.role}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="">— Select a role —</option>
                  {PERSONALITY_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Biography">
              <textarea
                ref={textareaRef}
                className="form-input"
                rows="4"
                placeholder="Write a biography..."
                required
                value={fields.biography}
                onChange={(e) =>
                  setFields((f) => ({ ...f, biography: e.target.value }))
                }
              />
            </FormField>

            <div className="admin-form-row">
              <FormField label="Category">
                <select
                  className="form-input"
                  value={fields.category}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {Object.entries(PERSONALITY_CATEGORIES).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Photo"
                hint={
                  editing && !imageFile ? "Leave empty to keep current" : ""
                }
              >
                <div className="admin-file-upload">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="admin-avatar-preview"
                    />
                  )}
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="form-input"
                    onChange={handleImageChange}
                  />
                </div>
              </FormField>
            </div>

            <div className="admin-form-row admin-form-row--3">
              <FormField label="Twitter">
                <input
                  className="form-input"
                  placeholder="https://twitter.com/..."
                  value={fields.twitter}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, twitter: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="LinkedIn">
                <input
                  className="form-input"
                  placeholder="https://linkedin.com/in/..."
                  value={fields.linkedin}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, linkedin: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Website">
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={fields.website}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, website: e.target.value }))
                  }
                />
              </FormField>
            </div>

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
                    : "Create Personality"}
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

        {/* ── List panel ─────────────────────────────────────────────────────── */}
        <section className="admin-list-panel">
          <div className="admin-section-header">
            <h2 className="admin-section-title">All Personalities</h2>
            <span className="admin-count-badge">{personalities.length}</span>
          </div>

          {loading ? (
            <div className="admin-loading">Loading...</div>
          ) : personalities.length === 0 ? (
            <div className="admin-empty">
              No personalities yet. Create your first one.
            </div>
          ) : (
            <div className="admin-list">
              {personalities.map((p) => (
                <div
                  key={p.id}
                  className={`admin-list-item ${editing?.id === p.id ? "admin-list-item--editing" : ""}`}
                >
                  <div className="personality-img-wrapper">
                    {p.image ? (
                      <img
                        src={`${BASE_URL}${p.image}`}
                        alt={p.name}
                        className="personality-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="personality-img-placeholder"
                      style={{ display: p.image ? "none" : "flex" }}
                    >
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="admin-list-item-info">
                    <p className="admin-list-item-title">{p.name}</p>
                    <div className="admin-list-item-meta">
                      {p.role && <span>{p.role}</span>}
                      <span
                        className="admin-category-pill"
                        style={{ background: "#f1f3f4" }}
                      >
                        {PERSONALITY_CATEGORIES[p.category] || p.category}
                      </span>
                    </div>
                  </div>

                  <div className="admin-list-item-actions">
                    <button
                      onClick={() => startEdit(p)}
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
                      onClick={() => handleDelete(p.id)}
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
