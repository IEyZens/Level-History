import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section
        style={{
          textAlign: "center",
          padding: "5rem 1.5rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1 className="section-title">Explore Video Game History</h1>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Dive into the events, personalities, and moments that shaped the
          gaming industry
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          {!user && (
            <>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/events" className="btn btn-outline">
                Browse Events
              </Link>
            </>
          )}
          {user && (
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
