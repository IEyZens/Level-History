import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createComment,
  deleteComment,
  getCommentsByEvent,
} from "../api/comments";
import { deleteEvent, getEventById } from "../api/events";
import { toggleLike } from "../api/likes";
import { useAuth } from "../context/AuthContext";

export default function EventDetailPage() {
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchEventData = useCallback(async () => {
    try {
      const eventData = await getEventById(id);
      const commentsData = await getCommentsByEvent(id);
      setEvent(eventData);
      setComments(commentsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  async function handleLike() {
    if (!user) {
      return;
    }

    try {
      await toggleLike("event", id);
      fetchEventData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) {
      return;
    }

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
    if (!window.confirm("Delete this comment?")) {
      return;
    }

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
    ) {
      return;
    }

    try {
      await deleteEvent(id);
      navigate("/events");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="page">
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !event && <p>Event not found.</p>}
      {event && (
        <div className="card" style={{ padding: "2rem" }}>
          <h1>{event.title}</h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            {new Date(event.date).toLocaleDateString()}
          </p>
          <p>{event.description}</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={handleLike}
              className="btn btn-outline"
              disabled={!user}
            >
              ❤️ Like ({event._count?.eventLikes || 0})
            </button>
            {user?.role === "ADMIN" && (
              <button onClick={handleDeleteEvent} className="btn btn-danger">
                Delete Event
              </button>
            )}
          </div>

          <h2 style={{ marginTop: "3rem" }}>Comments ({comments.length})</h2>
          {user && (
            <form onSubmit={handleAddComment} style={{ marginBottom: "2rem" }}>
              <textarea
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
          )}
          {!user && (
            <p style={{ color: "var(--color-text-muted)" }}>Login to comment</p>
          )}
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="card"
                style={{ padding: "1rem", marginBottom: "1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>{comment.user.username}</strong>
                  <small style={{ color: "var(--color-text-muted)" }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <p>{comment.content}</p>
                {user &&
                  (user.id === comment.userId || user.role === "ADMIN") && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn btn-danger"
                      style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
                    >
                      Delete
                    </button>
                  )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
