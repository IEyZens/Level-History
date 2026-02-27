import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthProvider from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

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
