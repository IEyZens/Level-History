import { useEffect, useState } from "react";
import EventModal from "./EventModal";

/**
 * Composant de timeline horizontale avec navigation par flèches
 * Affiche 3 événements à la fois (1 sur mobile) avec un modal au clic
 * @param {{ events: Array<Object> }} props - Liste des événements triés par date
 */
export default function Timeline({ events }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [direction, setDirection] = useState("right");

  // Tranche des événements actuellement affichés
  const visibleEvents = events.slice(currentIndex, currentIndex + visibleCount);

  // Adapte le nombre d'événements visibles selon la largeur de l'écran
  useEffect(() => {
    function handleResize() {
      setVisibleCount(window.innerWidth < 768 ? 1 : 3);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Navigue vers les événements précédents
   * Mémorise la direction pour animer la transition CSS
   */
  function handlePrev() {
    if (currentIndex > 0) {
      setDirection("left");
      setCurrentIndex(currentIndex - 1);
    }
  }

  /**
   * Navigue vers les événements suivants
   * Mémorise la direction pour animer la transition CSS
   */
  function handleNext() {
    if (currentIndex < events.length - visibleCount) {
      setDirection("right");
      setCurrentIndex(currentIndex + 1);
    }
  }

  return (
    <div className="timeline-wrapper">
      <div className="timeline-main">
        {/* Flèche précédent */}
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

        {/* Contenu animé — key force le remount pour déclencher l'animation CSS */}
        <div
          className="timeline-content"
          key={currentIndex}
          data-direction={direction}
        >
          {/* Cartes des événements */}
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

          {/* Axe horizontal avec points de repère */}
          <div className="timeline-axis">
            <div className="timeline-axis-line" />
            <div className="timeline-axis-dots">
              {visibleEvents.map((event) => (
                <div key={event.id} className="timeline-axis-dot" />
              ))}
            </div>
          </div>

          {/* Années et descriptions courtes sous l'axe */}
          <div className="timeline-years">
            {visibleEvents.map((event) => (
              <div key={event.id} className="timeline-year-block">
                <span className="timeline-year-num">
                  {new Date(event.date).getFullYear()}
                </span>
                {/* Description tronquée à 100 caractères */}
                <p className="timeline-year-desc">
                  {event.description?.slice(0, 100)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Flèche suivant */}
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

      {/* Modal d'aperçu — affiché au clic sur une carte */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
