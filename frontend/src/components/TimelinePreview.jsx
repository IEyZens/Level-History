import { useState } from "react";
import EventModal from "./EventModal";

export default function TimelinePreview({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const previewEvents = events.slice(0, 5);

  return (
    <div className="timeline-preview-wrapper">
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

      <div className="timeline-preview-axis">
        <div className="timeline-preview-line" />
        {previewEvents.map((event) => (
          <div key={event.id} className="timeline-preview-dot" />
        ))}
      </div>

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

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
