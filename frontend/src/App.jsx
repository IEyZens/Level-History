import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthProvider from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

/**
 * Remonte automatiquement en haut de page à chaque changement de route
 * Monté en dehors du routeur pour réagir à pathname sans rendu visible
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Racine de l'application
 * Enveloppe l'arbre dans AuthProvider et compose la structure navbar / contenu / footer
 */
function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <AppRouter />
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
