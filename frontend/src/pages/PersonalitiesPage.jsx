import { useEffect, useState } from "react";
import { getPersonalities } from "../api/personalities";

export default function PersonalitiesPage() {
  const [personalities, setPersonalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPersonalities() {
      try {
        const data = await getPersonalities();
        setPersonalities(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPersonalities();
  }, []);

  return (
    <div className="page">
      <h1>Personalities</h1>
      {loading && <p>Loading personalities...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && personalities.length === 0 && (
        <p>No personalities found.</p>
      )}
      {personalities && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {personalities.map((personality) => (
            <div
              key={personality.id}
              className="card"
              style={{ padding: "1.5rem" }}
            >
              <h3>{personality.name}</h3>
              <p>{personality.bio.slice(0, 100) + "..."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
