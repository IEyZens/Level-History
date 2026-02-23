import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalities } from "../api/personalities";
import Accordion from "../components/Accordion";

export default function PersonalitiesPage() {
  const [personalities, setPersonalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const navigate = useNavigate();

  const CATEGORY_LABELS = {
    ALL: "ALL",
    VISIONARY: "Visionaries",
    BUILDER: "Builders",
    EXECUTIVE: "Executives",
  };

  const CATEGORY_DESCRIPTIONS = {
    VISIONARY: "Those who set the rules and created the worlds",
    BUILDER: "The engineers who made the impossible possible",
    EXECUTIVE: "Those who built the empires and led the studios",
  };

  const FAQ_ITEMS = [
    {
      question: "Who are the personalities?",
      answer: "figures who shaped the video game industry",
    },
    {
      question: "How were they selected?",
      answer: "chosen for their impact as creators, innovators or executives",
    },
    {
      question: "Can I suggest someone?",
      answer: "yes, contact us with the person and their contributions",
    },
    {
      question: "Are there female personalities?",
      answer: "yes, women played a key role in the industry",
    },
    {
      question: "What do the categories mean?",
      answer:
        "Visionaries created worlds, Builders built the tech, Executives led the studios",
    },
  ];

  const filteredPersonalities =
    activeCategory === "ALL"
      ? personalities
      : personalities.filter((p) => p.category === activeCategory);

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
      <div className="personalities-hero">
        <h1>The Visionaries of Gaming</h1>
        <p>
          Explore the figures who shaped the video game industry and transformed
          digital entertainment forever.
        </p>
      </div>
      <div className="personalities-categories">
        <span className="section-label">Categories</span>
        <h2>Three Worlds, One Story</h2>
        <p>Discover the different branches of this industry.</p>
        <div className="categories-grid">
          {Object.entries(CATEGORY_LABELS)
            .filter(([category]) => category !== "ALL")
            .map(([category, label]) => (
              <div
                key={category}
                onClick={() => setActiveCategory(category)}
                className={
                  activeCategory === category
                    ? "category-card--active"
                    : "category-card"
                }
              >
                <span className="category-label">{label}</span>
                <p>{CATEGORY_DESCRIPTIONS[category]}</p>
              </div>
            ))}
        </div>
      </div>
      <div className="personalities-section">
        <span className="section-label">Legends</span>
        <h2>The Builders</h2>
        <p>
          Meet those who laid the foundations of everything young people love
          today.
        </p>
        <button
          className="btn btn-outline"
          onClick={() => console.log("learn-more")}
        >
          Learn more
        </button>
        {loading && <p>Loading...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && filteredPersonalities.length === 0 && (
          <p>No personalities found.</p>
        )}
        {!loading && !error && filteredPersonalities.length > 0 && (
          <div className="personalities-list">
            {filteredPersonalities.map((personality) => (
              <div key={personality.id}>
                <img
                  src={personality.image}
                  alt={personality.name}
                  className="personality-img"
                />
                <div className="personality-info">
                  <h3>{personality.name}</h3>
                  <p className="personality-role">{personality.role}</p>
                  <p className="personality-bio">
                    {personality.biography.slice(0, 120) + "..."}
                  </p>
                  <div className="personality-socials">
                    {personality.twitter && (
                      <a
                        href={personality.twitter}
                        target="_blank"
                        rel="noreferrer"
                      >
                        X
                      </a>
                    )}
                    {personality.linkedin && (
                      <a
                        href={personality.linkedin}
                        target="_blank"
                        rel="noreferrer"
                      >
                        in
                      </a>
                    )}
                    {personality.website && (
                      <a
                        href={personality.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🌐
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="personalities-faq">
        <h2>Questions</h2>
        <p>
          Find answers to the most common questions about our personalities.
        </p>
        <Accordion items={FAQ_ITEMS} />
        <div className="faq-cta">
          <h3>Any remaining questions?</h3>
          <p>Contact us directly to find out more.</p>
          <button onClick={() => console.log("contact")}>Write</button>
        </div>
      </div>
      <div className="personalities-cta">
        <h2>See Their Legacy in Action</h2>
        <p>
          Every personality left a mark on the timeline. Explore how their
          decisions shaped each era.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/events")}>
          Explore
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          Home
        </button>
      </div>
    </div>
  );
}
