import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getMyProfile, updateMyProfile } from "../api/users";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const navigate = useNavigate();

  async function fetchProfile() {
    try {
      const data = await getMyProfile();
      setProfile(data);

      if (username.role === "ADMIN") {
        const data = await getAdminStats();
        setStats(data);
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
    try {
      await updateMyProfile({
        username,
        email,
        avatar,
        password: password || undefined,
      });
      setUsername("");
      setEmail("");
      setAvatar("");
      setPassword("");
      fetchProfile();
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="profile-hero">
        {profile.avatar ? (
          <img className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">{username.charAt(0)}</div>
        )}
        <h1>{profile.username}</h1>
        <span>{profile.email}</span>
        {username.role === "ADMIN" && (
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
        {username.role === "ADMIN" && (
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin")}
          >
            Admin Panel
          </button>
        )}
      </div>
      {username.role === "ADMIN" && stats && (
        <div className="profile-admin-stats">
          <h2>Platform Statistics</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span className="stat-number">
                <span className="stat-label"></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
