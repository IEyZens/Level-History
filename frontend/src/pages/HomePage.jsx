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
    <div>
      {/* Hero */}
      <section className="home-hero">
        <h1>Explore Video Game History</h1>
        <p>
          Discover the events that shaped the industry. From the first games to
          revolutionary consoles, navigate through time and understand how it
          all began.
        </p>
        <div className="home-hero-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/events")}
          >
            Explore
          </button>
          <button
            className="btn btn-outline-dark"
            onClick={() =>
              document
                .getElementById("learn-more")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Learn more
          </button>
        </div>
      </section>

      {/* Three Ways to Learn */}
      <section className="section" id="learn-more">
        <div className="section-inner">
          <span className="section-label">Discover</span>
          <h2 className="home-learn-title">Three Ways to Learn</h2>
          <p className="home-learn-subtitle">
            Navigate through the decades of video games.
          </p>
          <div className="home-learn-grid">
            <div
              className="learn-card learn-card--featured"
              onClick={() => navigate("/events")}
            >
              <span className="learn-card-label">Timeline</span>
              <h3>Browse the Interactive Timeline</h3>
              <p>
                Explore the major events year by year with details and
                historical context.
              </p>
              <div className="learn-card-actions">
                <button className="btn btn-outline-white">Browse</button>
                <span className="learn-card-link">Fiche →</span>
              </div>
            </div>

            <div className="learn-card" onClick={() => navigate("/events")}>
              <div className="learn-card-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="2" y="8" width="20" height="8" rx="2" />
                  <path d="M6 12h4M8 10v4M15 12h.01M18 12h.01" />
                </svg>
              </div>
              <h3>Iconic Consoles</h3>
              <p>Discover the machines that revolutionized the industry.</p>
              <span className="learn-card-link">Fiche →</span>
            </div>

            <div
              className="learn-card"
              onClick={() => navigate("/personalities")}
            >
              <div className="learn-card-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <h3>Great Personalities</h3>
              <p>
                Learn the stories of the creators and visionaries who built it
                all.
              </p>
              <span className="learn-card-link">Fiche →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="section-inner">
          <span className="section-label">History</span>
          <h2 className="home-learn-title">An Interactive Industry Timeline</h2>
          <p className="home-learn-subtitle">
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
            <span className="learn-card-link">Timeline →</span>
          </div>
          {loading && <p>Loading...</p>}
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && !error && events.length > 0 && (
            <Timeline events={events} />
          )}
        </div>
      </section>

      {/* Community */}
      <section className="home-community">
        <h2>Join the Community</h2>
        <p>
          Create an account to comment on events, share your views and interact
          with other gaming history enthusiasts.
        </p>
        <div className="home-community-buttons">
          {!user && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            </>
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
      </section>
    </div>
  );
}
