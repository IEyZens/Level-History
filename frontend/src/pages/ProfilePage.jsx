import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getMyProfile, updateMyProfile } from "../api/users";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const navigate = useNavigate();

  async function fetchProfile() {
    try {
      const data = await getMyProfile();
      setProfile(data);

      if (data.role === "ADMIN") {
        const statsData = await getAdminStats();
        setStats(statsData);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess(false);
    try {
      const updatedUser = await updateMyProfile({
        username,
        email,
        avatar,
        password: password || undefined,
      });
      setUser(updatedUser);
      setProfile((prev) => ({ ...prev, ...updatedUser }));
      setPassword("");
      setEditMode(false);
      setFormSuccess(true);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="page">
      <div className="profile-hero">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.username}
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}
        <h1>{profile.username}</h1>
        <span>{profile.email}</span>
        {profile?.role === "ADMIN" && (
          <span className="profile-badge">Admin</span>
        )}
        <small>
          Member since {new Date(profile.createdAt).toLocaleDateString()}
        </small>
        <button
          className="btn btn-outline"
          onClick={() => setEditMode(!editMode)}
        >
          Edit Profile
        </button>
        {profile?.role === "ADMIN" && (
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin")}
          >
            Admin Panel
          </button>
        )}
      </div>
      {profile?.role === "ADMIN" && stats && (
        <div className="profile-admin-stats">
          <h2>Platform Statistics</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span className="stat-number">{stats.events}</span>
              <span className="stat-label">Events</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-number">{stats.users}</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-number">{stats.comments}</span>
              <span className="stat-label">Comments</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-number">{stats.likes}</span>
              <span className="stat-label">Likes</span>
            </div>
          </div>
        </div>
      )}
      {editMode && (
        <div className="profile-edit">
          <h2>Edit Profile</h2>
          {formError && <div className="alert alert-error">{formError}</div>}
          {formSuccess && (
            <div className="alert alert-success">
              Profile updated successfully!
            </div>
          )}
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input
                className="form-input"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty to keep current"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formLoading}
            >
              {formLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
      <div className="profile-activity">
        <div>
          <h2>Liked Events</h2>
          <div className="profile-liked-events">
            {profile.likes.map((like) => (
              <div
                key={like.event.id}
                className="profile-liked-card"
                onClick={() => navigate(`/events/${like.event.id}`)}
              >
                {like.event.image && (
                  <img src={like.event.image} alt={like.event.title} />
                )}
                <div className="profile-liked-info">
                  <p>{like.event.title}</p>
                  <small>
                    {new Date(like.event.date).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2>Recent Comments</h2>
          <div className="profile-comments-list">
            {profile.comments.map((comment) => (
              <div key={comment.id} className="profile-comment-item">
                <p className="profile-comment-meta">
                  On{" "}
                  <a onClick={() => navigate(`/events/${comment.event.id}`)}>
                    {comment.event.title}
                  </a>{" "}
                  · {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                <p className="profile-comment-content">
                  {comment.content.slice(0, 100)}
                  {comment.content.length > 100 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
