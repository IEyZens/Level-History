import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const ThemeContext = createContext();

/**
 * Hook d'accès au contexte d'authentification
 * @returns {{ user: Object|null, setUser: Function, clearUser: Function }}
 */
function useAuth() {
  return useContext(AuthContext);
}

/**
 * Hook d'accès au contexte de thème
 * @returns {{ theme: string, toggleTheme: Function }}
 */
function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Fournisseur global — gère l'authentification et le thème de l'application
 * Vérifie la session au montage via /auth/me et restaure le thème depuis localStorage
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // Restaure le thème sauvegardé ou utilise "light" par défaut
  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);

  // Vérifie si l'utilisateur a une session active au montage
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          // Gère les différentes structures de réponse possibles
          setUser(data.data?.user || data.data || data.user || data);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Synchronise le thème avec l'attribut HTML et localStorage à chaque changement
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /**
   * Bascule le thème avec une animation View Transitions API en cercle
   * L'animation part du centre du bouton cliqué et s'étend à tout l'écran
   * Fallback sans animation si l'API est indisponible ou si reduced-motion est activé
   * @param {React.MouseEvent} event - Événement du clic sur le bouton de thème
   */
  const toggleTheme = (event) => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Fallback sans animation (reduced-motion ou API non supportée)
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(newTheme);
      return;
    }

    // Calcule la position du bouton pour l'origine de l'animation
    const { top, left, width, height } =
      event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    // Calcule le rayon pour couvrir tout l'écran depuis le bouton
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const radius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    // Lance l'animation en clip-path circulaire après que la transition soit prête
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  // Déconnecte l'utilisateur du contexte sans appel API
  const clearUser = () => setUser(null);

  // Bloque le rendu jusqu'à la vérification de session initiale
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, clearUser }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export { AuthContext, ThemeContext, useAuth, useTheme };
export default AuthProvider;
