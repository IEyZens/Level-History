import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../api/events";
import Accordion from "../components/Accordion";
import Timeline from "../components/Timeline";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const navigate = useNavigate();

  const CATEGORY_LABELS = {
    ALL: "ALL",
    CONSOLE_RELEASE: "Console",
    GAME_RELEASE: "Games",
    COMPANY_FOUNDING: "Companies",
    TECHNOLOGY: "Technology",
    CULTURAL_IMPACT: "Culture",
    OTHER: "Other",
  };

  const FAQ_ITEMS = [
    {
      question: "How do I filter the timeline?",
      answer: "use the filter buttons to select by category",
    },
    {
      question: "Can I add my own events?",
      answer: "logged-in members can submit events for review",
    },
    {
      question: "Is the data accurate?",
      answer: "sourced from reliable references, maintained by the community",
    },
    {
      question: "Can I comment on events?",
      answer: "yes, logged-in members can share their thoughts on each event",
    },
    {
      question: "What period does the timeline cover?",
      answer: "from the earliest arcade games to today",
    },
  ];

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents();
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  function handleFilter(category) {
    setActiveCategory(category)
    if (category === "ALL") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((e) => e.category === category));
    }
  }

  return (
    <div className="page">
      <div className="timeline-hero">
        <h1>Navigate Through Time</h1>
        <p>
          Discover how the video game industry was built, one event at a time.
        </p>
      </div>
      <div className="timeline-section">
        <div className="timeline-section-header">
          <span className="section-label">Timeline</span>
          <h2>The Moments That Shaped Video Games</h2>
          <p>
            Explore the key milestones of the industry. Filter by year, console
            or innovation.
          </p>
        </div>
        <div className="timeline-filters">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <button
              key={category}
              onClick={() => handleFilter(category)}
              className={
                activeCategory === category
                  ? "btn btn-primary"
                  : "btn btn-outline"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="timeline-container">
          {loading && <p>Loading...</p>}
          {error && <div className="alert alert-error">{error}</div>}
          {filteredEvents.length === 0 && <p>No events found.</p>}
          {!loading && !error && filteredEvents.length > 0 && (
            <Timeline events={filteredEvents} />
          )}
        </div>
      </div>
      <div className="timeline-faq">
        <h2>Questions</h2>
        <p>
          Find answers to common questions about navigation and exploration.
        </p>
        <Accordion items={FAQ_ITEMS} />
        <div className="faq-cta">
          <h3>Need more help?</h3>
          <p>Contact our team for any specific question.</p>
          <button onClick={() => console.log("contact")}>Write to us</button>
        </div>
      </div>
      <div className="timeline-cta">
        <h2>Share Your Story</h2>
        <p>Join our community and enrich the timeline with your knowledge.</p>
        <button onClick={() => navigate("/register")}>Sign Up</button>
        <button onClick={() => navigate("/")}>Explore</button>
      </div>
    </div>
  );
}
