import { useEffect, useRef, useState } from "react";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../api/events";
import {
  createPersonality,
  deletePersonality,
  getPersonalities,
  updatePersonality,
} from "../api/personalities";
import { deleteUser, getAllUsers, updateUser } from "../api/users";
import { useAutoResize } from "../hooks/useAutoResize";

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_CATEGORIES = {
  OTHER: "Other",
  CONSOLE_RELEASE: "Console",
  GAME_RELEASE: "Games",
  COMPANY_FOUNDING: "Companies",
  TECHNOLOGY: "Technology",
  CULTURAL_IMPACT: "Culture",
};

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

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CATEGORY_BADGE_COLORS = {
  CONSOLE_RELEASE: "#e8f0fe",
  GAME_RELEASE: "#e6f4ea",
  COMPANY_FOUNDING: "#fce8e6",
  TECHNOLOGY: "#fef7e0",
  CULTURAL_IMPACT: "#f3e8fd",
  OTHER: "#f1f3f4",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormField({ label, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="admin-field-hint">{hint}</span>}
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div className="admin-section-header">
      <h2 className="admin-section-title">{title}</h2>
      {count !== undefined && (
        <span className="admin-count-badge">{count}</span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Events
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFields, setEventFields] = useState({
    title: "",
    description: "",
    date: "",
    image: "",
    category: "OTHER",
  });

  // Personalities
  const [personalities, setPersonalities] = useState([]);
  const [persLoading, setPersLoading] = useState(true);
  const [editingPersonality, setEditingPersonality] = useState(null);
  const [persFields, setPersFields] = useState({
    name: "",
    role: "",
    biography: "",
    category: "VISIONARY",
    twitter: "",
    linkedin: "",
    website: "",
  });
  const [persImageFile, setPersImageFile] = useState(null);
  const [persImagePreview, setPersImagePreview] = useState("");
  const persImageRef = useRef(null);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [userFields, setUserFields] = useState({
    username: "",
    email: "",
    avatar: "",
    role: "USER",
  });
  const [userFormLoading, setUserFormLoading] = useState(false);

  const eventTextareaRef = useRef(null);
  const persTextareaRef = useRef(null);
  useAutoResize(eventTextareaRef);
  useAutoResize(persTextareaRef);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  async function fetchEvents() {
    try {
      setEvents(await getEvents());
    } catch (e) {
      setError(e.message);
    } finally {
      setEventsLoading(false);
    }
  }

  async function fetchPersonalities() {
    try {
      setPersonalities(await getPersonalities());
    } catch (e) {
      setError(e.message);
    } finally {
      setPersLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setUsers(await getAllUsers());
    } catch (e) {
      setError(e.message);
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    fetchPersonalities();
    fetchUsers();
  }, []);

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  // ─── Event Handlers ───────────────────────────────────────────────────────

  function resetEventForm() {
    setEditingEvent(null);
    setEventFields({
      title: "",
      description: "",
      date: "",
      image: "",
      category: "OTHER",
    });
  }

  function handleEditEvent(event) {
    setEditingEvent(event);
    setEventFields({
      title: event.title,
      description: event.description,
      date: event.date?.slice(0, 10),
      image: event.image || "",
      category: event.category || "OTHER",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleEventSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventFields);
        showSuccess("Event updated successfully.");
        resetEventForm();
      } else {
        await createEvent(eventFields);
        showSuccess("Event created successfully.");
        setEventFields({
          title: "",
          description: "",
          date: "",
          image: "",
          category: "OTHER",
        });
      }
      fetchEvents();
    } catch (e) {
      setError(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteEvent(id) {
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

  // ─── Personality Handlers ─────────────────────────────────────────────────

  function resetPersForm() {
    setEditingPersonality(null);
    setPersFields({
      name: "",
      role: "",
      biography: "",
      category: "VISIONARY",
      twitter: "",
      linkedin: "",
      website: "",
    });
    setPersImageFile(null);
    setPersImagePreview("");
    if (persImageRef.current) persImageRef.current.value = "";
  }

  function handleEditPersonality(p) {
    setEditingPersonality(p);
    setPersFields({
      name: p.name,
      role: p.role || "",
      biography: p.biography || "",
      category: p.category || "VISIONARY",
      twitter: p.twitter || "",
      linkedin: p.linkedin || "",
      website: p.website || "",
    });
    setPersImageFile(null);
    setPersImagePreview(p.image ? `${BASE_URL}${p.image}` : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePersImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPersImageFile(file);
      setPersImagePreview(URL.createObjectURL(file));
    }
  }

  async function handlePersonalitySubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(persFields).forEach(([k, v]) => formData.append(k, v));
      if (persImageFile) formData.append("image", persImageFile);
      if (editingPersonality) {
        await updatePersonality(editingPersonality.id, formData);
        showSuccess("Personality updated successfully.");
        resetPersForm();
      } else {
        await createPersonality(formData);
        showSuccess("Personality created successfully.");
        resetPersForm();
      }
      fetchPersonalities();
    } catch (e) {
      setError(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeletePersonality(id) {
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="admin-layout page-fade">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-label">Admin</span>
          <h1 className="admin-sidebar-title">Dashboard</h1>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav-section">Content</p>
          {[
            {
              key: "events",
              label: "Events",
              count: events.length,
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              ),
            },
            {
              key: "personalities",
              label: "Personalities",
              count: personalities.length,
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              ),
            },
            {
              key: "users",
              label: "Users",
              count: users.length,
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
          ].map(({ key, label, count, icon }) => (
            <button
              key={key}
              className={`admin-nav-item ${activeTab === key ? "admin-nav-item--active" : ""}`}
              onClick={() => {
                setActiveTab(key);
                resetEventForm();
                resetPersForm();
                setUserSearch("");
              }}
            >
              <span className="admin-nav-icon">{icon}</span>
              <span className="admin-nav-label">{label}</span>
              <span className="admin-nav-count">{count}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-sidebar-footer-text">Level History</p>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className="admin-main">
        {/* Notifications */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div
            className="alert alert-success"
            style={{ marginBottom: "1.5rem" }}
          >
            {successMsg}
          </div>
        )}

        {/* ── Events ───────────────────────────────────────────────────────── */}
        {activeTab === "events" && (
          <div className="admin-content-grid">
            {/* Form */}
            <section className="admin-form-panel">
              <div className="admin-panel-header">
                <h2 className="admin-panel-title">
                  {editingEvent ? "Edit Event" : "New Event"}
                </h2>
                {editingEvent && (
                  <button
                    className="admin-panel-cancel"
                    onClick={resetEventForm}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              {editingEvent && (
                <div className="admin-editing-badge">
                  Editing: <strong>{editingEvent.title}</strong>
                </div>
              )}

              <form onSubmit={handleEventSubmit} className="admin-form">
                <FormField label="Title">
                  <input
                    className="form-input"
                    placeholder="e.g. Launch of the PlayStation"
                    value={eventFields.title}
                    required
                    onChange={(e) =>
                      setEventFields((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Description">
                  <textarea
                    ref={eventTextareaRef}
                    className="form-input"
                    rows="4"
                    placeholder="Describe this event..."
                    required
                    value={eventFields.description}
                    onChange={(e) =>
                      setEventFields((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <div className="admin-form-row">
                  <FormField label="Date">
                    <input
                      type="date"
                      className="form-input"
                      value={eventFields.date}
                      required
                      onChange={(e) =>
                        setEventFields((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Category">
                    <select
                      className="form-input"
                      value={eventFields.category}
                      onChange={(e) =>
                        setEventFields((f) => ({
                          ...f,
                          category: e.target.value,
                        }))
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
                    value={eventFields.image}
                    onChange={(e) =>
                      setEventFields((f) => ({ ...f, image: e.target.value }))
                    }
                  />
                </FormField>
                {eventFields.image && (
                  <div className="admin-image-preview">
                    <img
                      src={eventFields.image}
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
                      : editingEvent
                        ? "Save Changes"
                        : "Create Event"}
                  </button>
                  {editingEvent && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={resetEventForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* List */}
            <section className="admin-list-panel">
              <SectionHeader title="All Events" count={events.length} />
              {eventsLoading ? (
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
                      className={`admin-list-item ${editingEvent?.id === event.id ? "admin-list-item--editing" : ""}`}
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
                                CATEGORY_BADGE_COLORS[event.category] ||
                                "#f1f3f4",
                            }}
                          >
                            {EVENT_CATEGORIES[event.category] || event.category}
                          </span>
                        </div>
                      </div>
                      <div className="admin-list-item-actions">
                        <button
                          onClick={() => handleEditEvent(event)}
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
                          onClick={() => handleDeleteEvent(event.id)}
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
        )}

        {/* ── Personalities ─────────────────────────────────────────────────── */}
        {activeTab === "personalities" && (
          <div className="admin-content-grid">
            {/* Form */}
            <section className="admin-form-panel">
              <div className="admin-panel-header">
                <h2 className="admin-panel-title">
                  {editingPersonality ? "Edit Personality" : "New Personality"}
                </h2>
                {editingPersonality && (
                  <button
                    className="admin-panel-cancel"
                    onClick={resetPersForm}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              {editingPersonality && (
                <div className="admin-editing-badge">
                  Editing: <strong>{editingPersonality.name}</strong>
                </div>
              )}

              <form onSubmit={handlePersonalitySubmit} className="admin-form">
                <div className="admin-form-row">
                  <FormField label="Name">
                    <input
                      className="form-input"
                      placeholder="Full name"
                      value={persFields.name}
                      required
                      onChange={(e) =>
                        setPersFields((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Role">
                    <select
                      className="form-input"
                      value={persFields.role}
                      onChange={(e) =>
                        setPersFields((f) => ({ ...f, role: e.target.value }))
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
                    ref={persTextareaRef}
                    className="form-input"
                    rows="4"
                    placeholder="Write a biography..."
                    required
                    value={persFields.biography}
                    onChange={(e) =>
                      setPersFields((f) => ({
                        ...f,
                        biography: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <div className="admin-form-row">
                  <FormField label="Category">
                    <select
                      className="form-input"
                      value={persFields.category}
                      onChange={(e) =>
                        setPersFields((f) => ({
                          ...f,
                          category: e.target.value,
                        }))
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
                      editingPersonality && !persImageFile
                        ? "Leave empty to keep current"
                        : ""
                    }
                  >
                    <div className="admin-file-upload">
                      {persImagePreview && (
                        <img
                          src={persImagePreview}
                          alt="Preview"
                          className="admin-avatar-preview"
                        />
                      )}
                      <input
                        ref={persImageRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="form-input"
                        onChange={handlePersImageChange}
                      />
                    </div>
                  </FormField>
                </div>
                <div className="admin-form-row admin-form-row--3">
                  <FormField label="Twitter">
                    <input
                      className="form-input"
                      placeholder="https://twitter.com/..."
                      value={persFields.twitter}
                      onChange={(e) =>
                        setPersFields((f) => ({
                          ...f,
                          twitter: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="LinkedIn">
                    <input
                      className="form-input"
                      placeholder="https://linkedin.com/in/..."
                      value={persFields.linkedin}
                      onChange={(e) =>
                        setPersFields((f) => ({
                          ...f,
                          linkedin: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Website">
                    <input
                      className="form-input"
                      placeholder="https://..."
                      value={persFields.website}
                      onChange={(e) =>
                        setPersFields((f) => ({
                          ...f,
                          website: e.target.value,
                        }))
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
                      : editingPersonality
                        ? "Save Changes"
                        : "Create Personality"}
                  </button>
                  {editingPersonality && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={resetPersForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* List */}
            <section className="admin-list-panel">
              <SectionHeader
                title="All Personalities"
                count={personalities.length}
              />
              {persLoading ? (
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
                      className={`admin-list-item ${editingPersonality?.id === p.id ? "admin-list-item--editing" : ""}`}
                    >
                      <div className="admin-list-item-img admin-list-item-img--round">
                        {p.image ? (
                          <img src={`${BASE_URL}${p.image}`} alt={p.name} />
                        ) : (
                          <div className="admin-list-item-img-placeholder admin-list-item-img-placeholder--round">
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
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
                          onClick={() => handleEditPersonality(p)}
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
                          onClick={() => handleDeletePersonality(p.id)}
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
        )}
        {/* ── Users ────────────────────────────────────────────────────────── */}
        {activeTab === "users" &&
          (() => {
            const filteredUsers = users.filter(
              (u) =>
                u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearch.toLowerCase()),
            );

            async function handleUserSubmit(e) {
              e.preventDefault();
              setUserFormLoading(true);
              setError("");
              try {
                await updateUser(editingUser.id, userFields);
                showSuccess("User updated successfully.");
                setEditingUser(null);
                fetchUsers();
              } catch (err) {
                setError(err.message);
              } finally {
                setUserFormLoading(false);
              }
            }

            return (
              <div className="admin-content-grid page-fade">
                {/* Edit form — only visible when editing */}
                {editingUser && (
                  <section className="admin-form-panel">
                    <div className="admin-panel-header">
                      <h2 className="admin-panel-title">Edit User</h2>
                      <button
                        className="admin-panel-cancel"
                        onClick={() => setEditingUser(null)}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                    <div className="admin-editing-badge">
                      Editing: <strong>{editingUser.username}</strong>
                    </div>
                    <form onSubmit={handleUserSubmit} className="admin-form">
                      <FormField label="Username">
                        <input
                          className="form-input"
                          value={userFields.username}
                          onChange={(e) =>
                            setUserFields((f) => ({
                              ...f,
                              username: e.target.value,
                            }))
                          }
                        />
                      </FormField>
                      <FormField label="Email">
                        <input
                          type="email"
                          className="form-input"
                          value={userFields.email}
                          onChange={(e) =>
                            setUserFields((f) => ({
                              ...f,
                              email: e.target.value,
                            }))
                          }
                        />
                      </FormField>
                      <FormField
                        label="Avatar URL"
                        hint="Paste a direct image URL"
                      >
                        <input
                          className="form-input"
                          placeholder="https://..."
                          value={userFields.avatar}
                          onChange={(e) =>
                            setUserFields((f) => ({
                              ...f,
                              avatar: e.target.value,
                            }))
                          }
                        />
                        {userFields.avatar && (
                          <img
                            src={userFields.avatar}
                            alt="Preview"
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              marginTop: "0.5rem",
                              border: "1.5px solid var(--color-border)",
                            }}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                      </FormField>
                      <FormField label="Role">
                        <select
                          className="form-input"
                          value={userFields.role}
                          onChange={(e) =>
                            setUserFields((f) => ({
                              ...f,
                              role: e.target.value,
                            }))
                          }
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </FormField>
                      <div className="admin-form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={userFormLoading}
                        >
                          {userFormLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setEditingUser(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </section>
                )}

                {/* List */}
                <section
                  className="admin-list-panel"
                  style={{ gridColumn: editingUser ? "auto" : "1 / -1" }}
                >
                  <div className="admin-section-header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flex: 1,
                      }}
                    >
                      <h2 className="admin-section-title">All Users</h2>
                      <span className="admin-count-badge">{users.length}</span>
                    </div>
                    <input
                      className="form-input"
                      style={{
                        width: "220px",
                        padding: "0.42rem 0.8rem",
                        fontSize: "0.85rem",
                      }}
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  {usersLoading ? (
                    <div className="admin-loading">Loading...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="admin-empty">No users found.</div>
                  ) : (
                    <div className="admin-list">
                      {filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          className={`admin-list-item ${editingUser?.id === u.id ? "admin-list-item--editing" : ""}`}
                        >
                          <div className="admin-list-item-img admin-list-item-img--round">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.username} />
                            ) : (
                              <div className="admin-list-item-img-placeholder admin-list-item-img-placeholder--round">
                                {u.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="admin-list-item-info">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <p className="admin-list-item-title">
                                {u.username}
                              </p>
                              <span
                                className="admin-role-badge"
                                data-role={u.role}
                              >
                                {u.role === "ADMIN" ? "Admin" : "User"}
                              </span>
                            </div>
                            <div className="admin-list-item-meta">
                              <span>{u.email}</span>
                              <span>·</span>
                              <span>{u._count?.comments ?? 0} comments</span>
                              <span>·</span>
                              <span>{u._count?.likes ?? 0} likes</span>
                              <span>·</span>
                              <span>
                                Joined{" "}
                                {new Date(u.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="admin-list-item-actions">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserFields({
                                  username: u.username,
                                  email: u.email,
                                  avatar: u.avatar || "",
                                  role: u.role,
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
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
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `Delete user "${u.username}"? This is irreversible.`,
                                  )
                                )
                                  return;
                                try {
                                  await deleteUser(u.id);
                                  fetchUsers();
                                  showSuccess("User deleted.");
                                } catch (err) {
                                  setError(err.message);
                                }
                              }}
                              className="admin-action-btn admin-action-btn--delete"
                              disabled={u.role === "ADMIN"}
                              title={
                                u.role === "ADMIN"
                                  ? "Cannot delete an admin"
                                  : "Delete user"
                              }
                              style={{ opacity: u.role === "ADMIN" ? 0.3 : 1 }}
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
            );
          })()}
      </main>
    </div>
  );
}
