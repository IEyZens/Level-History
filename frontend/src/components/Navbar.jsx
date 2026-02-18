import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { useAuth, useTheme } from "../context/AuthContext";

export default function Navbar() {
  const { user, clearUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearUser();
      navigate("/login");
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Level History
      </Link>
      <div className="navbar-links">
        <Link to="/events">Events</Link>
        <Link to="/personalities">Personalities</Link>
        {user?.role === "ADMIN" && (
          <Link to="/admin" className="navbar-admin">
            Admin
          </Link>
        )}
      </div>
      <div className="navbar-auth">
        <button onClick={toggleTheme} className="btn btn-outline">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user && (
          <>
            <span className="navbar-username">{user.username}</span>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
