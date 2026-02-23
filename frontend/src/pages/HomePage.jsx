import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../api/events";
import Timeline from "../components/Timeline";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHomePage() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHomePage();
  }, []);

  return (
    <div className="page">
      <div className="home-hero">
        <h1>Explore Video Game History</h1>
        <p>
          Discover the events, consoles and personalities that built the gaming
          industry from the ground up.
        </p>
        <div className="home-hero-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/events")}
          >
            Explore
          </button>
          <button
            className="btn btn-outline"
            onClick={() =>
              document
                .getElementById("learn-more")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Learn more
          </button>
        </div>
      </div>
      <div className="home-learn" id="learn-more">
        <span className="section-label">Discover</span>
        <h2>Three Ways to Learn</h2>
        <p>Navigate through the decades of video games.</p>
        <div className="home-learn-grid">
          <div
            className="learn-card learn-card--featured"
            onClick={() => navigate("/events")}
          >
            <span className="learn-card-label">Timeline</span>
            <h3>Browse the Interactive Timeline</h3>
            <p>
              Explore the major events year by year with details and historical
              context.
            </p>
            <div className="learn-card-actions">
              <button className="btn btn-outline-white">Browse</button>
              <span>Timeline →</span>
            </div>
          </div>
          <div className="learn-card" onClick={() => navigate("/events")}>
            <span>🎮</span>
            <h3>Iconic Consoles</h3>
            <p>Discover the machines that revolutionized the industry.</p>
            <span>Timeline →</span>
          </div>
          <div
            className="learn-card"
            onClick={() => navigate("/personalities")}
          >
            <span>👤</span>
            <h3>Great Personalities</h3>
            <p>
              Learn the stories of the creators and visionaries who built it
              all.
            </p>
            <span>Timeline →</span>
          </div>
        </div>
      </div>
      <div className="home-timeline">
        <span className="section-label">History</span>
        <h2>An Interactive Industry Timeline</h2>
        <p>
          Click on each point to see the details, read other enthusiasts'
          comments and share your own views.
        </p>
        <div className="home-timeline-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate("/events")}
          >
            View all
          </button>
          <span>Timeline →</span>
        </div>
        {loading && <p>Loading...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && events.length > 0 && (
          <Timeline events={events} />
        )}
      </div>
      <div className="home-community">
        <h2>Join the Community</h2>
        <p>
          Create an account to comment on events, share your views and interact
          with other gaming history enthusiasts.
        </p>
        <div className="home-community-buttons">
          {!user && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          )}
          {!user && (
            <button
              className="btn btn-outline"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          )}
          {user && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/events")}
            >
              Browse Events
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
