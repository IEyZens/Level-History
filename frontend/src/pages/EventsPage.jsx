import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../api/events";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="page">
      <h1>Events</h1>
      {!loading && !error && events.length === 0 && <p>No events found.</p>}
      {!loading && !error && events.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {events.map((event) => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              style={{ textDecoration: "none" }}
            >
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3>{event.title}</h3>
                <p>{event.description.slice(0, 120) + "..."}</p>
                <small>{new Date(event.date).toLocaleDateString()}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
