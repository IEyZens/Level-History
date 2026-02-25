import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-logo">
              <div className="footer-brand-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="2" y="8" width="20" height="8" rx="2" />
                  <path d="M6 12h4M8 10v4M15 12h.01M18 12h.01" />
                </svg>
              </div>
              <span>
                Level <strong>History</strong>
              </span>
            </Link>
            <p className="footer-brand-desc">
              A community-driven archive of the most important moments in gaming
              history — from Pong to the present.
            </p>
            <div className="footer-pixels">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li>
                <Link to="/events">Timeline</Link>
              </li>
              <li>
                <Link to="/events">Events</Link>
              </li>
              <li>
                <Link to="/personalities">Personalities</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li>
                <Link to="/">About us</Link>
              </li>
              <li>
                <Link to="/">Contact</Link>
              </li>
              <li>
                <Link to="/">Privacy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Level History — Made for gamers & historians</p>
          <div className="footer-socials">
            <a href="#" className="footer-social-btn" aria-label="X">
              X
            </a>
            <a href="#" className="footer-social-btn" aria-label="LinkedIn">
              in
            </a>
            <a href="#" className="footer-social-btn" aria-label="GitHub">
              gh
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
