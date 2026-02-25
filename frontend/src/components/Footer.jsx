import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <Link to="/" className="footer-logo">
          Logo
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
        <p>© 2026 Level History All rights reserved</p>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Use</Link>
          <Link to="/cookies">Cookie Settings</Link>
        </div>
      </div>
    </footer>
  );
}
