import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getMyProfile, updateMyProfile } from "../api/users";
import { useAuth } from "../context/AuthContext";

/**
 * Page de profil utilisateur — sidebar + contenu par onglet
 * Sections : Overview (stats + résumé), Settings (édition du profil), Activity (likes + commentaires)
 * Les admins ont accès aux statistiques globales de la plateforme et au lien Admin Panel
 */
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
  const [activeSection, setActiveSection] = useState("overview");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const navigate = useNavigate();

  /** Charge le profil et les stats admin si applicable */
  async function fetchProfile() {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setUsername(data.username);
      setEmail(data.email);
      setAvatar(data.avatar || "");
      if (data.role === "ADMIN") {
        const statsData = await getAdminStats();
        setStats(statsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   * Met à jour le profil et synchronise le contexte auth
   * Le mot de passe n'est envoyé que s'il est renseigné
   */
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
      // Met à jour le contexte global et l'état local
      setUser(updatedUser);
      setProfile((prev) => ({ ...prev, ...updatedUser }));
      setPassword("");
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  // ─── États de chargement et d'erreur ─────────────────────────────────────

  if (loading) {
    return (
      <div className="profile-layout">
        <div
          className="profile-main"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              color: "var(--color-text-subtle)",
              fontFamily: "var(--font-body)",
            }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="page" style={{ paddingTop: "4rem" }}>
        <div className="alert alert-error">{error}</div>
      </div>
    );

  if (!profile) return null;

  const isAdmin = profile.role === "ADMIN";

  /** Items de navigation de la sidebar — Admin Panel ajouté conditionnellement */
  const NAV_ITEMS = [
    {
      key: "overview",
      label: "Overview",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Settings",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      key: "activity",
      label: "Activity",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      // Badge avec le total des actions de l'utilisateur
      count: (profile.likes?.length || 0) + (profile.comments?.length || 0),
    },
    ...(isAdmin
      ? [
          {
            key: "admin",
            label: "Admin Panel",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="profile-layout page-fade">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        {/* Identité de l'utilisateur */}
        <div className="profile-sidebar-identity">
          <div className="profile-sidebar-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} />
            ) : (
              <div className="profile-sidebar-avatar-placeholder">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-sidebar-info">
            <p className="profile-sidebar-name">{profile.username}</p>
            <p className="profile-sidebar-email">{profile.email}</p>
          </div>
          {isAdmin && <span className="profile-badge">Admin</span>}
        </div>

        <nav className="admin-nav" style={{ marginTop: "1.5rem" }}>
          <p className="admin-nav-section">Account</p>
          {NAV_ITEMS.map(({ key, label, icon, count }) => (
            <button
              key={key}
              className={`admin-nav-item ${activeSection === key ? "admin-nav-item--active" : ""}`}
              // Admin Panel redirige vers /admin, les autres changent la section active
              onClick={() =>
                key === "admin" ? navigate("/admin") : setActiveSection(key)
              }
            >
              <span className="admin-nav-icon">{icon}</span>
              <span className="admin-nav-label">{label}</span>
              {count !== undefined && count > 0 && (
                <span className="admin-nav-count">{count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-sidebar-footer-text">
            Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────────────────────────── */}
      <main className="admin-main">
        {/* ── Overview ──────────────────────────────────────────────────────── */}
        {activeSection === "overview" && (
          <div className="profile-overview page-fade">
            {/* Carte d'identité principale */}
            <div className="profile-overview-hero">
              <div className="profile-overview-avatar">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.username} />
                ) : (
                  <div className="profile-overview-avatar-placeholder">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-overview-identity">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <h1 className="profile-overview-name">{profile.username}</h1>
                  {isAdmin && <span className="profile-badge">Admin</span>}
                </div>
                <p className="profile-overview-email">{profile.email}</p>
                <p className="profile-overview-since">
                  Member since{" "}
                  {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => setActiveSection("settings")}
                style={{ marginLeft: "auto", alignSelf: "flex-start" }}
              >
                Edit Profile
              </button>
            </div>

            {/* Statistiques globales — visibles uniquement pour les admins */}
            {isAdmin && stats && (
              <div style={{ marginTop: "1.5rem" }}>
                <p
                  className="admin-nav-section"
                  style={{ marginBottom: "1rem" }}
                >
                  Platform Statistics
                </p>
                <div className="admin-stats-grid">
                  {[
                    { label: "Events", value: stats.events },
                    { label: "Users", value: stats.users },
                    { label: "Comments", value: stats.comments },
                    { label: "Likes", value: stats.likes },
                  ].map(({ label, value }) => (
                    <div key={label} className="admin-stat-card">
                      <span className="stat-number">{value}</span>
                      <span className="stat-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résumé rapide de l'activité personnelle */}
            <div className="profile-quick-stats">
              <div className="profile-quick-stat">
                <span className="profile-quick-stat-value">
                  {profile.likes?.length || 0}
                </span>
                <span className="profile-quick-stat-label">Liked events</span>
              </div>
              <div className="profile-quick-stat">
                <span className="profile-quick-stat-value">
                  {profile.comments?.length || 0}
                </span>
                <span className="profile-quick-stat-label">Comments</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings ──────────────────────────────────────────────────────── */}
        {activeSection === "settings" && (
          <div className="page-fade">
            <div
              className="admin-content-grid"
              style={{ gridTemplateColumns: "420px 1fr" }}
            >
              {/* Formulaire d'édition */}
              <section className="admin-form-panel">
                <div className="admin-panel-header">
                  <h2 className="admin-panel-title">Edit Profile</h2>
                </div>

                {formError && (
                  <div
                    className="alert alert-error"
                    style={{ marginBottom: "1rem" }}
                  >
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div
                    className="alert alert-success"
                    style={{ marginBottom: "1rem" }}
                  >
                    Profile updated successfully!
                  </div>
                )}

                <form onSubmit={handleUpdate} className="admin-form">
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
                      placeholder="https://..."
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                    {/* Aperçu de l'avatar si une URL est saisie */}
                    {avatar && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <img
                          src={avatar}
                          alt="Preview"
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1.5px solid var(--color-border)",
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      placeholder="Leave empty to keep current"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="admin-field-hint">
                      Minimum 8 characters.
                    </span>
                  </div>
                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formLoading}
                    >
                      {formLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setActiveSection("overview")}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>

              {/* Récapitulatif des informations actuelles du compte */}
              <section
                className="admin-list-panel"
                style={{ padding: "1.5rem" }}
              >
                <p
                  className="admin-nav-section"
                  style={{ marginBottom: "1rem" }}
                >
                  Your account
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {[
                    { label: "Username", value: profile.username },
                    { label: "Email", value: profile.email },
                    { label: "Role", value: profile.role },
                    {
                      label: "Member since",
                      value: new Date(profile.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.2rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.14rem",
                          color: "var(--color-text-subtle)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--color-text)",
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── Activity ──────────────────────────────────────────────────────── */}
        {activeSection === "activity" && (
          <div
            className="page-fade"
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* Événements likés — cliquables pour naviguer vers le détail */}
            <section className="admin-list-panel">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Liked Events</h2>
                <span className="admin-count-badge">
                  {profile.likes?.length || 0}
                </span>
              </div>
              {!profile.likes?.length ? (
                <div className="admin-empty">No liked events yet.</div>
              ) : (
                <div className="admin-list">
                  {profile.likes.map((like) => (
                    <div
                      key={like.event.id}
                      className="admin-list-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/events/${like.event.id}`)}
                    >
                      <div className="admin-list-item-img">
                        {like.event.image ? (
                          <img src={like.event.image} alt={like.event.title} />
                        ) : (
                          <div className="admin-list-item-img-placeholder">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="admin-list-item-info">
                        <p className="admin-list-item-title">
                          {like.event.title}
                        </p>
                        <div className="admin-list-item-meta">
                          <span>
                            {new Date(like.event.date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        style={{
                          width: "14px",
                          height: "14px",
                          color: "var(--color-text-subtle)",
                          flexShrink: 0,
                        }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Commentaires récents — cliquables pour naviguer vers l'événement */}
            <section className="admin-list-panel">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Recent Comments</h2>
                <span className="admin-count-badge">
                  {profile.comments?.length || 0}
                </span>
              </div>
              {!profile.comments?.length ? (
                <div className="admin-empty">No comments yet.</div>
              ) : (
                <div className="admin-list">
                  {profile.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="admin-list-item"
                      style={{
                        cursor: "pointer",
                        alignItems: "flex-start",
                        gap: "1rem",
                        flexDirection: "column",
                      }}
                      onClick={() => navigate(`/events/${comment.event.id}`)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          gap: "1rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-text-subtle)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          On{" "}
                          <strong
                            style={{
                              color: "var(--color-text-muted)",
                              fontWeight: 600,
                            }}
                          >
                            {comment.event.title}
                          </strong>
                          {" · "}
                          {new Date(comment.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "var(--color-text-subtle)",
                            flexShrink: 0,
                          }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                      {/* Contenu tronqué à 140 caractères */}
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-text-muted)",
                          fontFamily: "var(--font-body)",
                          lineHeight: 1.6,
                        }}
                      >
                        {comment.content.slice(0, 140)}
                        {comment.content.length > 140 ? "…" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
