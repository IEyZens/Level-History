import { useEffect, useRef, useState } from "react";
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
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
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
      answer:
        "Use the filter buttons to select by year, console or type of innovation. The timeline updates instantly.",
    },
    {
      question: "Can I add my own events?",
      answer:
        "Logged-in members can submit events to enrich the timeline with their knowledge. Each contribution is verified before publication.",
    },
    {
      question: "Is the data accurate?",
      answer:
        "Each event comes from reliable and documented sources. Our community of enthusiasts ensures the accuracy of information.",
    },
    {
      question: "Can I comment on events?",
      answer:
        "Yes, logged-in members can share their views and link the key milestones. Comments create a dialogue around each important moment.",
    },
    {
      question: "What period does the timeline cover?",
      answer:
        "We document the industry from its debut to today. From the first arcade games to the latest generation consoles.",
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

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleFilter(category) {
    setActiveCategory(category);
    if (category === "ALL") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((e) => e.category === category));
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="events-hero">
        <h1>Navigate Through Time</h1>
        <p>
          Discover how the video game industry was built, one event at a time.
        </p>
      </section>

      {/* Timeline section */}
      <section className="section">
        <div className="section-inner">
          <span className="section-label">Timeline</span>
          <h2 className="events-section-title">
            The Moments That Shaped Video Games
          </h2>
          <p className="events-section-desc">
            Explore the key milestones of the industry. Filter by year, console
            or innovation.
          </p>
          <div className="events-filter-row">
            <div className="events-filter-dropdown" ref={filterRef}>
              <button
                className="btn btn-outline-dark events-filter-btn"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                Filter
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {filterOpen && (
                <div className="events-filter-menu">
                  {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
                    <button
                      key={category}
                      onClick={() => {
                        handleFilter(category);
                        setFilterOpen(false);
                      }}
                      className={`events-filter-item ${activeCategory === category ? "events-filter-item--active" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="events-details-link">
              Details
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </div>
          <div className="timeline-container">
            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-error">{error}</div>}
            {filteredEvents.length === 0 && !loading && <p>No events found.</p>}
            {!loading && !error && filteredEvents.length > 0 && (
              <Timeline events={filteredEvents} />
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="section-inner events-section-inner">
          <h2 className="events-section-title">Questions</h2>
          <p className="events-section-desc">
            Find answers to common questions about navigation and exploration.
          </p>
          <Accordion items={FAQ_ITEMS} />
          <div className="faq-cta">
            <h3>Need more help?</h3>
            <p>Contact our team for any specific question.</p>
            <button className="btn btn-outline-dark">Write to us</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="events-cta">
        <h2>Share Your Story</h2>
        <p>Join our community and enrich the timeline with your knowledge.</p>
        <div className="events-cta-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
          <button
            className="btn btn-outline-dark"
            onClick={() => navigate("/")}
          >
            Explore
          </button>
        </div>
        <div className="events-cta-banner" />
      </section>
    </div>
  );
}
