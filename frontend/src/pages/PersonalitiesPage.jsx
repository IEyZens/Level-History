import { useEffect, useState } from "react";
import { getPersonalities } from "../api/personalities";

export default function PersonalitiesPage() {
  const [personalities, setPersonalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

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

  const filteredPersonalities = personalities.slice(activeCategory === "ALL");

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
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
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
    </div>
  );
}
