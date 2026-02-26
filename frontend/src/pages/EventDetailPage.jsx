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

  const fetchEventData = useCallback(async () => {
    try {
      const eventData = await getEventById(id);
      const commentsData = await getCommentsByEvent(id);
      setEvent(eventData);
      setIsLiked(eventData.likes?.some((l) => l.userId === user?.id) ?? false);
      setComments(commentsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  async function handleLike() {
    if (!user) return;
    try {
      await toggleLike("event", id);
      fetchEventData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await createComment(id, newComment);
      setNewComment("");
      fetchEventData();
    } catch (error) {
      console.error(error);
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      fetchEventData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeleteEvent() {
    if (
      !window.confirm("Delete this event? This will also delete all comments.")
    )
      return;
    try {
      await deleteEvent(id);
      navigate("/events");
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (error)
    return (
      <div className="alert alert-error" style={{ margin: "2rem" }}>
        {error}
      </div>
    );
  if (!event) return <p style={{ padding: "2rem" }}>Event not found.</p>;

  return (
    <div>
      {/* Hero */}
      <section className="event-detail-hero">
        <h1>{event.title}</h1>
        <p>
          {new Date(event.date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </section>

      {/* Contenu */}
      <section className="section">
        <div className="event-detail-content">
          {/* Image */}
          <div className="event-detail-banner">
            {event.image ? (
              <img src={event.image} alt={event.title} />
            ) : (
              <div className="event-detail-banner-placeholder" />
            )}
          </div>

          {/* Description */}
          <div className="event-detail-description">{event.description}</div>

          {/* Like */}
          <div className="event-detail-likes">
            <button onClick={handleLike} className="like-btn" disabled={!user}>
              {isLiked ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="red"
                  stroke="red"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
              <span>{event.likes?.length ?? 0}</span>
            </button>
            {user?.role === "ADMIN" && (
              <button onClick={handleDeleteEvent} className="btn btn-danger">
                Delete Event
              </button>
            )}
          </div>

          {/* Commentaires */}
          <div className="event-detail-comments">
            <h3>Comments ({comments.length})</h3>
            {user ? (
              <form
                onSubmit={handleAddComment}
                className="event-detail-comment-form"
              >
                <textarea
                  ref={textareaRef}
                  className="form-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={commentLoading}
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </form>
            ) : (
              <p className="event-detail-login-hint">Login to comment</p>
            )}
            <div className="event-detail-comments-list">
              {comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="event-detail-comment">
                    <div className="event-detail-comment-header">
                      <strong>{comment.author.username}</strong>
                      <small>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p>{comment.content}</p>
                    {user &&
                      (user.id === comment.authorId ||
                        user.role === "ADMIN") && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="btn btn-danger"
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.3rem 0.8rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          Delete
                        </button>
                      )}
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
