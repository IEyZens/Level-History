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
    VISIONARY: "Les artisans des mondes virtuels",
    BUILDER: "Pionniers technologiques",
    EXECUTIVE: "Dirigeants et visionnaires",
  };

  const CATEGORY_ICONS = {
    VISIONARY: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    BUILDER: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    EXECUTIVE: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };

  const CATEGORY_DESCRIPTIONS = {
    VISIONARY: "Those who set the rules and created the worlds.",
    BUILDER: "The engineers who made the impossible possible.",
    EXECUTIVE: "Those who built the empires and led the studios.",
  };

  const CATEGORY_SUBLABELS = {
    VISIONARY: "Creators",
    BUILDER: "Pioneers",
    EXECUTIVE: "Executives",
  };

  const FAQ_ITEMS = [
    {
      question: "Who are the personalities?",
      answer: "Figures who shaped the video game industry.",
    },
    {
      question: "How were they selected?",
      answer: "Chosen for their impact as creators, innovators or executives.",
    },
    {
      question: "Can I suggest someone?",
      answer: "Yes, contact us with the person and their contributions.",
    },
    {
      question: "Are there female personalities?",
      answer: "Yes, women played a key role in the industry.",
    },
    {
      question: "What do the categories mean?",
      answer:
        "Visionaries created worlds, Builders built the tech, Executives led the studios.",
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
    <div>
      {/* Hero */}
      <section className="personalities-hero">
        <h1>Les visionnaires du jeu</h1>
        <p>
          Explorez les figures qui ont façonné l'industrie du jeu vidéo et
          transformé le divertissement numérique à jamais.
        </p>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-inner">
          <span className="section-label">Categories</span>
          <h2 className="personalities-section-title">
            Three Worlds, One Story
          </h2>
          <p className="personalities-section-desc">
            Discover the different branches of this industry.
          </p>
          <div className="personalities-categories-grid">
            {Object.entries(CATEGORY_LABELS)
              .filter(([category]) => category !== "ALL")
              .map(([category, label], index) => (
                <div
                  key={category}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === category ? "ALL" : category,
                    )
                  }
                  className={`personalities-category-card ${index === 0 ? "personalities-category-card--featured" : ""} ${activeCategory === category ? "personalities-category-card--active" : ""}`}
                >
                  <div className="personalities-category-top">
                    <span className="personalities-category-sublabel">
                      {CATEGORY_SUBLABELS[category]}
                    </span>
                    <div className="personalities-category-icon">
                      {CATEGORY_ICONS[category]}
                    </div>
                  </div>
                  <h3 className="personalities-category-title">{label}</h3>
                  <p className="personalities-category-desc">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </p>
                  <div className="personalities-category-footer">
                    {index === 0 ? (
                      <button
                        className="btn btn-outline-white"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}
                      >
                        Explore
                      </button>
                    ) : (
                      <span className="personalities-category-arrow">
                        Fiche ›
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Personalities list */}
      <section className="section">
        <div className="section-inner" style={{ textAlign: "left" }}>
          <span className="section-label" style={{ textAlign: "left" }}>
            Legends
          </span>
          <div className="personalities-legends-layout">
            <div className="personalities-legends-left">
              <h2 className="personalities-section-title">The Builders</h2>
              <p className="personalities-section-desc">
                Meet those who laid the foundations of everything young people
                love today.
              </p>
              <button
                className="btn btn-outline-dark"
                style={{ width: "fit-content" }}
              >
                Learn more
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ width: "14px", height: "14px" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <div className="personalities-legends-right">
              {loading && <p>Loading...</p>}
              {error && <div className="alert alert-error">{error}</div>}
              {!loading && !error && filteredPersonalities.length === 0 && (
                <p>No personalities found.</p>
              )}
              {!loading && !error && filteredPersonalities.length > 0 && (
                <div className="personalities-list">
                  {filteredPersonalities.map((personality) => (
                    <div key={personality.id} className="personality-card">
                      <div className="personality-img-wrapper">
                        {personality.image ? (
                          <img
                            src={personality.image}
                            alt={personality.name}
                            className="personality-img"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="personality-img-placeholder"
                          style={{
                            display: personality.image ? "none" : "flex",
                          }}
                        >
                          {personality.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="personality-info">
                        <h3>{personality.name}</h3>
                        <p className="personality-role">{personality.role}</p>
                        <p className="personality-bio">
                          {personality.biography?.slice(0, 120)}...
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
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="section-inner">
          <h2 className="personalities-section-title">Questions</h2>
          <p className="personalities-section-desc">
            Find answers to the most common questions about our personalities.
          </p>
          <Accordion items={FAQ_ITEMS} />
          <div className="faq-cta">
            <h3>Any remaining questions?</h3>
            <p>Contact us directly to find out more.</p>
            <button className="btn btn-outline-dark">Write</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="personalities-cta">
        <h2>See Their Legacy in Action</h2>
        <p>
          Every personality left a mark on the timeline. Explore how their
          decisions shaped each era.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/events")}
          >
            Explore
          </button>
          <button
            className="btn btn-outline-dark"
            onClick={() => navigate("/")}
          >
            Home
          </button>
        </div>
        <div className="personalities-cta-banner" />
      </section>
    </div>
  );
}
