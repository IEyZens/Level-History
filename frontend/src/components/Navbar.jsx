import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import logo from "../assets/logo.svg";
import { useAuth, useTheme } from "../context/AuthContext";

/**
 * Barre de navigation globale de l'application
 * Affiche les liens de navigation, le bouton de thème et les actions d'authentification
 * Le lien Admin n'est visible que pour les utilisateurs avec le rôle ADMIN
 */
export default function Navbar() {
  const { user, clearUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Déconnecte l'utilisateur — efface le contexte et redirige vers /login
   * Le bloc finally garantit la déconnexion locale même si l'API échoue
   */
  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearUser();
      navigate("/login");
    }
  }

  /**
   * Retourne la classe CSS active si le chemin correspond à la route courante
   * @param {string} path - Chemin à comparer avec l'URL courante
   */
  function isActive(path) {
    return location.pathname === path ? "navbar-link--active" : "";
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logo} alt="Level History" className="navbar-logo" />
      </Link>

      <div className="navbar-links">
        <Link to="/" className={`navbar-link ${isActive("/")}`}>
          Home
        </Link>
        <Link to="/events" className={`navbar-link ${isActive("/events")}`}>
          Timeline
        </Link>
        <Link
          to="/personalities"
          className={`navbar-link ${isActive("/personalities")}`}
        >
          Personalities
        </Link>

        {/* Lien admin visible uniquement pour les administrateurs */}
        {user?.role === "ADMIN" && (
          <Link
            to="/admin"
            className={`navbar-link navbar-link--admin ${isActive("/admin")}`}
          >
            Admin
          </Link>
        )}
      </div>

      <div className="navbar-auth">
        {/* Bouton de bascule de thème — passe la position du clic pour l'animation View Transitions */}
        <button onClick={(e) => toggleTheme(e)} className="navbar-theme-btn">
          {theme === "light" ? (
            // Icône lune — thème clair actif
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            // Icône soleil — thème sombre actif
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        {/* Utilisateur connecté — avatar cliquable + bouton de déconnexion */}
        {user && (
          <>
            <Link to="/profile" className="navbar-avatar" title={user.username}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                // Initiale du nom d'utilisateur si pas d'avatar
                <div className="navbar-avatar-placeholder">
                  {user.username?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
            </Link>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </>
        )}

        {/* Utilisateur non connecté — liens vers login et inscription */}
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
