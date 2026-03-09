import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createComment,
  deleteComment,
  getCommentsByEvent,
} from "../api/comments";
import { deleteEvent, getEventById } from "../api/events";
import { toggleLike } from "../api/likes";
import { useAuth } from "../context/AuthContext";
import { useAutoResize } from "../hooks/useAutoResize";

/** Labels affichés pour chaque catégorie d'événement */
const CATEGORY_LABELS = {
  CONSOLE_RELEASE: "Console",
  GAME_RELEASE: "Games",
  COMPANY_FOUNDING: "Companies",
  TECHNOLOGY: "Technology",
  CULTURAL_IMPACT: "Culture",
  OTHER: "Other",
};

/**
 * Page de détail d'un événement
 * Affiche l'événement, le bouton like, et la section commentaires
 * Les admins peuvent supprimer l'événement et tous les commentaires
 */
export default function EventDetailPage() {
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  useAutoResize(textareaRef);

  /**
   * Charge l'événement et ses commentaires
   * Détermine si l'utilisateur courant a déjà liké l'événement
   */
  const fetchEventData = useCallback(async () => {
    try {
      const eventData = await getEventById(id);
      const commentsData = await getCommentsByEvent(id);
      setEvent(eventData);
      // Vérifie si l'utilisateur connecté figure dans la liste des likes
      setIsLiked(eventData.likes?.some((l) => l.userId === user?.id) ?? false);
      setComments(commentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  /** Bascule le like de l'utilisateur sur cet événement */
  async function handleLike() {
    if (!user) return;
    try {
      await toggleLike("event", id);
      fetchEventData();
    } catch (err) {
      console.error(err);
    }
  }

  /** Soumet un nouveau commentaire et rafraîchit la liste */
  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await createComment(id, newComment);
      setNewComment("");
      fetchEventData();
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  }

  /** Supprime un commentaire après confirmation (propriétaire ou admin) */
  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      fetchEventData();
    } catch (err) {
      console.error(err);
    }
  }

  /** Supprime l'événement et redirige vers la liste (admin uniquement) */
  async function handleDeleteEvent() {
    if (
      !window.confirm("Delete this event? This will also delete all comments.")
    )
      return;
    try {
      await deleteEvent(id);
      navigate("/events");
    } catch (err) {
      setError(err.message);
    }
  }

  // ─── États de chargement et d'erreur ─────────────────────────────────────

  if (loading)
    return (
      <div className="page" style={{ paddingTop: "6rem", textAlign: "center" }}>
        <p
          style={{
            color: "var(--color-text-subtle)",
            fontFamily: "var(--font-body)",
          }}
        >
          Loading...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="page" style={{ paddingTop: "4rem" }}>
        <div className="alert alert-error">{error}</div>
      </div>
    );

  if (!event)
    return (
      <div className="page" style={{ paddingTop: "4rem" }}>
        <p>Event not found.</p>
      </div>
    );

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="page-fade">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="event-detail-hero">
        <span className="section-label">
          {CATEGORY_LABELS[event.category] || "Event"}
        </span>
        <h1>{event.title}</h1>
        <p>
          {new Date(event.date).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </section>

      {/* ── Contenu principal ────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="event-detail-content">
          {/* Image de bannière ou placeholder */}
          <div className="event-detail-banner">
            {event.image ? (
              <img src={event.image} alt={event.title} />
            ) : (
              <div className="event-detail-banner-placeholder" />
            )}
          </div>

          {/* Description et actions (like + suppression admin) */}
          <div className="event-detail-body">
            <p className="event-detail-description">{event.description}</p>

            <div className="event-detail-actions">
              {/* Bouton like — désactivé si non connecté */}
              <button
                onClick={handleLike}
                className="like-btn"
                disabled={!user}
                title={user ? (isLiked ? "Unlike" : "Like") : "Login to like"}
              >
                {isLiked ? (
                  // Cœur plein — événement liké
                  <svg
                    viewBox="0 0 24 24"
                    fill="#e05555"
                    stroke="#e05555"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ) : (
                  // Cœur vide — événement non liké
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
                <span>
                  {event.likes?.length ?? 0}{" "}
                  {event.likes?.length === 1 ? "like" : "likes"}
                </span>
              </button>

              {/* Bouton de suppression visible uniquement pour les admins */}
              {user?.role === "ADMIN" && (
                <button
                  onClick={handleDeleteEvent}
                  className="btn btn-danger"
                  style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
                >
                  Delete Event
                </button>
              )}
            </div>
          </div>

          {/* ── Section commentaires ──────────────────────────────────────────── */}
          <div className="event-detail-comments">
            <div className="event-detail-comments-header">
              <h3>Comments</h3>
              <span className="admin-count-badge">{comments.length}</span>
            </div>

            {user ? (
              // Formulaire d'ajout de commentaire — visible si connecté
              <form
                onSubmit={handleAddComment}
                className="event-detail-comment-form"
              >
                <textarea
                  ref={textareaRef}
                  className="form-input"
                  value={newComment}
                  rows="3"
                  required
                  placeholder="Share your thoughts on this moment..."
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={commentLoading}
                  >
                    {commentLoading ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            ) : (
              // Invitation à se connecter pour commenter
              <div className="event-detail-login-hint">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  style={{ width: "16px", height: "16px", flexShrink: 0 }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>
                  <button
                    className="event-detail-login-link"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </button>{" "}
                  to leave a comment.
                </span>
              </div>
            )}

            {/* Liste des commentaires */}
            <div className="event-detail-comments-list">
              {comments.length === 0 ? (
                <div
                  className="admin-empty"
                  style={{ padding: "2rem 0", textAlign: "left" }}
                >
                  Be the first to comment on this event.
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="event-detail-comment">
                    <div className="event-detail-comment-header">
                      <div className="event-detail-comment-author">
                        {/* Avatar avec initiale */}
                        <div className="event-detail-comment-avatar">
                          {comment.author.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{comment.author.username}</strong>
                          <small>
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </small>
                        </div>
                      </div>
                      {/* Bouton de suppression — visible pour l'auteur ou un admin */}
                      {user &&
                        (user.id === comment.authorId ||
                          user.role === "ADMIN") && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="admin-action-btn admin-action-btn--delete"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        )}
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
