import { useState } from "react";

/**
 * Composant accordéon — affiche une liste de questions/réponses
 * Un seul item peut être ouvert à la fois
 * @param {{ items: Array<{ question: string, answer: string }> }} props
 */
export default function Accordion({ items }) {
  // Index de l'item actuellement ouvert, null si tous fermés
  const [openIndex, setOpenIndex] = useState(null);

  /**
   * Bascule l'ouverture d'un item
   * Ferme l'item si déjà ouvert, ouvre le nouveau sinon
   */
  function handleToggle(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => handleToggle(index)}
          >
            <span>{item.question}</span>
            <svg
              className={`accordion-icon ${openIndex === index ? "accordion-icon--open" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div
            className={`accordion-content ${openIndex === index ? "accordion-content--open" : ""}`}
          >
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
