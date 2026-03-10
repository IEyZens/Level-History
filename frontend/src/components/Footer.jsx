import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

/**
 * Pied de page global de l'application
 * Contient la navigation principale, les liens légaux et le copyright
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <Link to="/">
          <img src={logo} alt="Level History" className="footer-logo-img" />
        </Link>
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/events">Timeline</Link>
          <Link to="/personalities">Personalities</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Level History. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Use</Link>
          <Link to="/cookies">Cookie Settings</Link>
        </div>
      </div>
    </footer>
  );
}
