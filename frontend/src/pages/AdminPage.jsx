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

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormField({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function FormActions({ loading, editing, onCreate, onCancel }) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : editing ? "Save Changes" : onCreate}
      </button>
      {editing && (
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchEvents();
    fetchPersonalities();
  }, []);

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
    setActiveTab("events");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleEventSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventFields);
        resetEventForm();
      } else {
        await createEvent(eventFields);
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
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteEvent(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (e) {
      console.error(e);
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
    setActiveTab("personalities");
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
    try {
      const formData = new FormData();
      Object.entries(persFields).forEach(([k, v]) => formData.append(k, v));
      if (persImageFile) formData.append("image", persImageFile);

      if (editingPersonality) {
        await updatePersonality(editingPersonality.id, formData);
        resetPersForm();
      } else {
        await createPersonality(formData);
        resetPersForm();
      }
      fetchPersonalities();
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeletePersonality(id) {
    if (!window.confirm("Delete this personality?")) return;
    try {
      await deletePersonality(id);
      fetchPersonalities();
    } catch (e) {
      console.error(e);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page-fade">
      <h1>Admin Panel</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-tabs">
        {["events", "personalities"].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? "admin-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Events Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "events" && (
        <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
          <form
            onSubmit={handleEventSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <FormField label="Title">
              <input
                className="form-input"
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
                required
                value={eventFields.description}
                onChange={(e) =>
                  setEventFields((f) => ({ ...f, description: e.target.value }))
                }
              />
            </FormField>
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
            <FormField label="Image URL">
              <input
                className="form-input"
                value={eventFields.image}
                onChange={(e) =>
                  setEventFields((f) => ({ ...f, image: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Category">
              <select
                className="form-input"
                value={eventFields.category}
                onChange={(e) =>
                  setEventFields((f) => ({ ...f, category: e.target.value }))
                }
              >
                {Object.entries(EVENT_CATEGORIES).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </FormField>
            <FormActions
              loading={formLoading}
              editing={editingEvent}
              onCreate="Create Event"
              onCancel={resetEventForm}
            />
          </form>

          <h2>Manage Events</h2>
          {eventsLoading && <p>Loading...</p>}
          {events.map((event) => (
            <div
              key={event.id}
              className="card"
              style={{ padding: "1rem", marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{event.title}</strong>
                  <br />
                  <small>{new Date(event.date).toLocaleDateString()}</small>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="btn btn-outline-dark"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="btn btn-danger"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Personalities Tab ───────────────────────────────────────────────── */}
      {activeTab === "personalities" && (
        <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h2>
            {editingPersonality ? "Edit Personality" : "Create Personality"}
          </h2>
          <form
            onSubmit={handlePersonalitySubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <FormField label="Name">
              <input
                className="form-input"
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
            <FormField label="Biography">
              <textarea
                ref={persTextareaRef}
                className="form-input"
                rows="4"
                required
                value={persFields.biography}
                onChange={(e) =>
                  setPersFields((f) => ({ ...f, biography: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Image">
              {persImagePreview && (
                <img
                  src={persImagePreview}
                  alt="Preview"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "0.5rem",
                  }}
                />
              )}
              <input
                ref={persImageRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-input"
                onChange={handlePersImageChange}
                required={!editingPersonality}
              />
              {editingPersonality && !persImageFile && (
                <small style={{ color: "var(--color-text-muted)" }}>
                  Leave empty to keep current image
                </small>
              )}
            </FormField>
            <FormField label="Category">
              <select
                className="form-input"
                value={persFields.category}
                onChange={(e) =>
                  setPersFields((f) => ({ ...f, category: e.target.value }))
                }
              >
                {Object.entries(PERSONALITY_CATEGORIES).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Twitter URL">
              <input
                className="form-input"
                value={persFields.twitter}
                onChange={(e) =>
                  setPersFields((f) => ({ ...f, twitter: e.target.value }))
                }
              />
            </FormField>
            <FormField label="LinkedIn URL">
              <input
                className="form-input"
                value={persFields.linkedin}
                onChange={(e) =>
                  setPersFields((f) => ({ ...f, linkedin: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Website URL">
              <input
                className="form-input"
                value={persFields.website}
                onChange={(e) =>
                  setPersFields((f) => ({ ...f, website: e.target.value }))
                }
              />
            </FormField>
            <FormActions
              loading={formLoading}
              editing={editingPersonality}
              onCreate="Create Personality"
              onCancel={resetPersForm}
            />
          </form>

          <h2>Manage Personalities</h2>
          {persLoading && <p>Loading...</p>}
          {personalities.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{ padding: "1rem", marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  {p.image && (
                    <img
                      src={`${BASE_URL}${p.image}`}
                      alt={p.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div>
                    <strong>{p.name}</strong>
                    <br />
                    <small>
                      {p.role} · {p.category}
                    </small>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleEditPersonality(p)}
                    className="btn btn-outline-dark"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePersonality(p.id)}
                    className="btn btn-danger"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
