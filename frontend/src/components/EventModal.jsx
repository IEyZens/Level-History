import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

/**
 * Modal d'aperçu d'un événement — rendu via un portail React sur #root
 * Fermeture possible via la touche Échap, le bouton ✕ ou le clic sur le backdrop
 * @param {{ event: Object|null, onClose: Function }} props
 */
export default function EventModal({ event, onClose }) {
  const navigate = useNavigate();

  // Cible du portail — #root ou body en fallback
  const portalTarget = document.getElementById("root") || document.body;

  // Fermeture de la modal avec la touche Échap
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Aucun événement sélectionné — rien à afficher
  if (event === null) {
    return null;
  }

  return createPortal(
    // Clic sur le backdrop ferme la modal
    <div className="modal-backdrop" onClick={onClose}>
      {/* Stoppe la propagation pour éviter la fermeture au clic sur le contenu */}
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
