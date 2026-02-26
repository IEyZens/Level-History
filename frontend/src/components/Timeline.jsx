import { useEffect, useState } from "react";
import EventModal from "./EventModal";

export default function Timeline({ events }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const visibleEvents = events.slice(currentIndex, currentIndex + visibleCount);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else {
        setVisibleCount(3);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleNext() {
    if (currentIndex < events.length - visibleCount) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  return (
    <div className="timeline-wrapper">
      {/* Cartes + flèches sur les côtés */}
      <div className="timeline-main">
        <button
          className="timeline-nav-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="timeline-content">
          <div className="timeline-cards">
            {visibleEvents.map((event) => (
              <div
                key={event.id}
                className="timeline-card"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="timeline-card-image">
                  {event.image ? (
                    <img src={event.image} alt={event.title} />
                  ) : (
                    <div className="timeline-card-placeholder" />
                  )}
                </div>
                <p className="timeline-card-title">{event.title}</p>
              </div>
            ))}
          </div>

          {/* Axe avec points */}
          <div className="timeline-axis">
            <div className="timeline-axis-line" />
            <div className="timeline-axis-dots">
              {visibleEvents.map((event) => (
                <div key={event.id} className="timeline-axis-dot" />
              ))}
            </div>
          </div>

          {/* Années + descriptions */}
          <div className="timeline-years">
            {visibleEvents.map((event) => (
              <div key={event.id} className="timeline-year-block">
                <span className="timeline-year-num">
                  {new Date(event.date).getFullYear()}
                </span>
                <p className="timeline-year-desc">
                  {event.description?.slice(0, 100)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          className="timeline-nav-btn"
          onClick={handleNext}
          disabled={currentIndex >= events.length - visibleCount}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
