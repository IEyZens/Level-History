import { useEffect, useState } from "react";
import { deleteUser, getAllUsers, updateUser } from "../api/users";

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormField({ label, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="admin-field-hint">{hint}</span>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminUsers({ onCountChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [fields, setFields] = useState({
    username: "",
    email: "",
    avatar: "",
    role: "USER",
  });

  // ─── Data ──────────────────────────────────────────────────────────────────

  async function fetchUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
      onCountChange?.(data.length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  function startEdit(u) {
    setEditing(u);
    setFields({
      username: u.username,
      email: u.email,
      avatar: u.avatar || "",
      role: u.role,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      await updateUser(editing.id, fields);
      showSuccess("User updated successfully.");
      setEditing(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Delete user "${u.username}"? This is irreversible.`))
      return;
    try {
      await deleteUser(u.id);
      fetchUsers();
      showSuccess("User deleted.");
    } catch (err) {
      setError(err.message);
    }
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
          {successMsg}
        </div>
      )}

      <div className="admin-content-grid page-fade">
        {/* ── Edit form — only visible when editing ──────────────────────────── */}
        {editing && (
          <section className="admin-form-panel">
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">Edit User</h2>
              <button
                className="admin-panel-cancel"
                onClick={() => setEditing(null)}
              >
                ✕ Cancel
              </button>
            </div>

            <div className="admin-editing-badge">
              Editing: <strong>{editing.username}</strong>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <FormField label="Username">
                <input
                  className="form-input"
                  value={fields.username}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </FormField>

              <FormField label="Email">
                <input
                  type="email"
                  className="form-input"
                  value={fields.email}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </FormField>

              <FormField label="Avatar URL" hint="Paste a direct image URL">
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={fields.avatar}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, avatar: e.target.value }))
                  }
                />
                {fields.avatar && (
                  <img
                    src={fields.avatar}
                    alt="Preview"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginTop: "0.5rem",
                      border: "1.5px solid var(--color-border)",
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
              </FormField>

              <FormField label="Role">
                <select
                  className="form-input"
                  value={fields.role}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </FormField>

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
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── List panel ─────────────────────────────────────────────────────── */}
        <section
          className="admin-list-panel"
          style={{ gridColumn: editing ? "auto" : "1 / -1" }}
        >
          <div className="admin-section-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flex: 1,
              }}
            >
              <h2 className="admin-section-title">All Users</h2>
              <span className="admin-count-badge">{users.length}</span>
            </div>
            <input
              className="form-input"
              style={{
                width: "220px",
                padding: "0.42rem 0.8rem",
                fontSize: "0.85rem",
              }}
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="admin-loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">No users found.</div>
          ) : (
            <div className="admin-list">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className={`admin-list-item ${editing?.id === u.id ? "admin-list-item--editing" : ""}`}
                >
                  <div className="admin-list-item-img admin-list-item-img--round">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.username} />
                    ) : (
                      <div className="admin-list-item-img-placeholder admin-list-item-img-placeholder--round">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="admin-list-item-info">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <p className="admin-list-item-title">{u.username}</p>
                      <span className="admin-role-badge" data-role={u.role}>
                        {u.role === "ADMIN" ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className="admin-list-item-meta">
                      <span>{u.email}</span>
                      <span>·</span>
                      <span>{u._count?.comments ?? 0} comments</span>
                      <span>·</span>
                      <span>{u._count?.likes ?? 0} likes</span>
                      <span>·</span>
                      <span>
                        Joined{" "}
                        {new Date(u.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="admin-list-item-actions">
                    <button
                      onClick={() => startEdit(u)}
                      className="admin-action-btn admin-action-btn--edit"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="admin-action-btn admin-action-btn--delete"
                      disabled={u.role === "ADMIN"}
                      title={
                        u.role === "ADMIN"
                          ? "Cannot delete an admin"
                          : "Delete user"
                      }
                      style={{ opacity: u.role === "ADMIN" ? 0.3 : 1 }}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
