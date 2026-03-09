import { Link } from "react-router-dom";

/**
 * Page 404 — affichée pour toute route non reconnue
 */
export default function NotFoundPage() {
  return (
    <div
      className="page-fade"
      style={{ textAlign: "center", padding: "5rem 1.5rem" }}
    >
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}
