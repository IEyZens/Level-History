import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

export default function EventModal({ event, onClose }) {
  const navigate = useNavigate();
  const portalTarget = document.getElementById("root") || document.body;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (event === null) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {event.image && (
          <img src={event.image} alt={event.title} className="modal-image" />
        )}
        <div className="modal-body">
          <span className="modal-category">{event.category}</span>
          <h2>{event.title}</h2>
          <p className="modal-date">
            {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="modal-description">{event.description}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            See full details
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
