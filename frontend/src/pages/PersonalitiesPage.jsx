import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalities } from "../api/personalities";
import Accordion from "../components/Accordion";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CATEGORY_LABELS = {
  ALL: "All",
  VISIONARY: "Visionaries",
  BUILDER: "Builders",
  EXECUTIVE: "Executives",
};

const CATEGORY_SUBLABELS = {
  VISIONARY: "Creators",
  BUILDER: "Pioneers",
  EXECUTIVE: "Executives",
};

const CATEGORY_DESCRIPTIONS = {
  VISIONARY: "Those who set the rules and created the worlds.",
  BUILDER: "The engineers who made the impossible possible.",
  EXECUTIVE: "Those who built the empires and led the studios.",
};

const CATEGORY_ICONS = {
  VISIONARY: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  BUILDER: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  EXECUTIVE: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const LEGENDS_CONTENT = {
  ALL: {
    title: "All Personalities",
    desc: "Discover all the figures who shaped the video game industry.",
  },
  VISIONARY: {
    title: "The Visionaries",
    desc: "Those who set the rules and created entire worlds from imagination.",
  },
  BUILDER: {
    title: "The Builders",
    desc: "Meet those who laid the foundations of everything young people love today.",
  },
  EXECUTIVE: {
    title: "The Executives",
    desc: "Those who built the empires and led the studios to global success.",
  },
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

export default function PersonalitiesPage() {
  const [personalities, setPersonalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const navigate = useNavigate();

  const filteredPersonalities =
    activeCategory === "ALL"
      ? personalities
      : personalities.filter((p) => p.category === activeCategory);

  useEffect(() => {
    async function fetchPersonalities() {
      try {
        setPersonalities(await getPersonalities());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPersonalities();
  }, []);

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const legend = LEGENDS_CONTENT[activeCategory];

  return (
    <div className="page-fade">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="personalities-hero">
        <span className="section-label">Personalities</span>
        <h1>The Visionaries of Gaming</h1>
        <p>
          Explore the figures who shaped the video game industry and transformed
          digital entertainment forever.
        </p>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: "2rem" }}>
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
              .filter(([cat]) => cat !== "ALL")
              .map(([category], index) => (
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
                  <h3 className="personalities-category-title">
                    {CATEGORY_LABELS[category]}
                  </h3>
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
                        View ›
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── Personalities List ───────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ textAlign: "left" }}>
          <span className="section-label" style={{ textAlign: "left" }}>
            Legends
          </span>
          <div className="personalities-legends-layout">
            {/* Left sticky */}
            <div className="personalities-legends-left">
              <h2 className="personalities-section-title">{legend.title}</h2>
              <p className="personalities-section-desc">{legend.desc}</p>
              {activeCategory !== "ALL" && (
                <button
                  className="btn btn-outline-dark"
                  style={{ width: "fit-content", marginTop: "0.5rem" }}
                  onClick={() => setActiveCategory("ALL")}
                >
                  View all
                </button>
              )}
              <div className="personalities-nav-pills">
                {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                  <button
                    key={cat}
                    className={`personalities-nav-pill ${activeCategory === cat ? "personalities-nav-pill--active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right list */}
            <div className="personalities-legends-right">
              {loading && (
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Loading...
                </p>
              )}
              {error && <div className="alert alert-error">{error}</div>}
              {!loading && !error && filteredPersonalities.length === 0 && (
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  No personalities in this category.
                </p>
              )}
              {!loading && !error && filteredPersonalities.length > 0 && (
                <div className="personalities-list">
                  {filteredPersonalities.map((personality) => {
                    const isExpanded = expandedIds.has(personality.id);
                    const bio = personality.biography ?? "";
                    const isLong = bio.length > 120;
                    return (
                      <div key={personality.id} className="personality-card">
                        <div className="personality-img-wrapper">
                          {personality.image ? (
                            <img
                              src={`${BASE_URL}${personality.image}`}
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
                            {isExpanded || !isLong ? (
                              bio
                            ) : (
                              <>
                                {bio.slice(0, 120)}
                                <span>... </span>
                                <button
                                  onClick={() => toggleExpand(personality.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "var(--color-text)",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                  }}
                                >
                                  View more
                                </button>
                              </>
                            )}
                            {isExpanded && isLong && (
                              <button
                                onClick={() => toggleExpand(personality.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  color: "var(--color-text)",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  textUnderlineOffset: "3px",
                                  marginLeft: "0.25rem",
                                }}
                              >
                                View less
                              </button>
                            )}
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-inner">
          <span className="section-label">FAQ</span>
          <h2 className="personalities-section-title">Questions</h2>
          <p className="personalities-section-desc">
            Find answers to the most common questions about our personalities.
          </p>
          <Accordion items={FAQ_ITEMS} />
          <div className="faq-cta">
            <h3>Any remaining questions?</h3>
            <p>Contact us directly to find out more.</p>
            <button
              className="btn btn-outline-dark"
              onClick={() => navigate("/contact")}
            >
              Write to us
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="personalities-cta">
        <span className="section-label">Timeline</span>
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
            Explore Timeline
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
