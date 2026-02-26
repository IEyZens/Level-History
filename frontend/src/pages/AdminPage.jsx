import { useEffect, useRef, useState } from "react";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../api/events";
import { useAutoResize } from "../hooks/useAutoResize";

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const textareaRef = useRef(null);
  useAutoResize(textareaRef);

  const EVENT_CATEGORIES = {
    OTHER: "Other",
    CONSOLE_RELEASE: "Console",
    GAME_RELEASE: "Games",
    COMPANY_FOUNDING: "Companies",
    TECHNOLOGY: "Technology",
    CULTURAL_IMPACT: "Culture",
  };

  async function fetchAdmin() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmin();
  }, []);

  function handleEdit(event) {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date?.slice(0, 10));
    setImage(event.image || "");
    setCategory(event.category || "OTHER");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setDate("");
    setImage("");
    setCategory("OTHER");
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title,
          description,
          date,
          image,
          category,
        });
        handleCancelEdit();
      } else {
        await createEvent({ title, description, date, image, category });
        setTitle("");
        setDescription("");
        setDate("");
        setImage("");
        setCategory("OTHER");
      }
      fetchAdmin();
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      fetchAdmin();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              ref={textareaRef}
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              className="form-input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {Object.entries(EVENT_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
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
                className="btn btn-outline-dark"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2 style={{ marginTop: "2rem" }}>Manage Events</h2>
        {loading && <p>Loading events...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && events.length === 0 && <p>No events yet.</p>}
        {!loading &&
          !error &&
          events.length > 0 &&
          events.map((event) => (
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
                    onClick={() => handleEdit(event)}
                    className="btn btn-outline-dark"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
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
    </div>
  );
}
