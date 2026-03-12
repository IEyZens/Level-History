import { useState } from "react";
import EventModal from "./EventModal";

/**
 * Aperçu condensé de la timeline — affiche les 5 premiers événements
 * Utilisé sur la page d'accueil comme teaser avant la timeline complète
 * @param {{ events: Array<Object> }} props - Liste complète des événements
 */
export default function TimelinePreview({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Limite l'affichage aux 5 premiers événements
  const [isMobile] = useState(() => window.innerWidth < 768);
  const previewEvents = events.slice(0, isMobile ? 3 : 5);

  return (
    <div className="timeline-preview-wrapper">
      {/* Cartes cliquables avec image ou placeholder */}
      <div className="timeline-preview-cards">
        {previewEvents.map((event) => (
          <div
            key={event.id}
            className="timeline-preview-card"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="timeline-preview-image">
              {event.image ? (
                <img src={event.image} alt={event.title} />
              ) : (
                <div className="timeline-preview-placeholder" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Axe horizontal avec points de repère */}
      <div className="timeline-preview-axis">
        <div className="timeline-preview-line" />
        {previewEvents.map((event) => (
          <div key={event.id} className="timeline-preview-dot" />
        ))}
      </div>

      {/* Années et titres sous l'axe */}
      <div className="timeline-preview-dates">
        {previewEvents.map((event) => (
          <div key={event.id} className="timeline-preview-date">
            <span className="timeline-preview-year">
              {new Date(event.date).getFullYear()}
            </span>
            <p className="timeline-preview-desc">{event.title}</p>
          </div>
        ))}
      </div>

      {/* Modal d'aperçu — affiché au clic sur une carte */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
