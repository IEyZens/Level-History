import sanitizeHtml from "sanitize-html";

/**
 * Assainit une chaîne de caractères en supprimant tout HTML et JavaScript injecté
 * Les balises interdites sont échappées récursivement plutôt que supprimées
 * @param {*} input - Valeur à assainir (retournée telle quelle si ce n'est pas une chaîne)
 * @returns {*} Chaîne assainie ou valeur originale
 */
export const sanitize = (input) => {
  if (typeof input !== "string") {
    return input;
  }

  return sanitizeHtml(input, {
    allowedTags: [], // Aucune balise HTML autorisée
    allowedAttributes: {}, // Aucun attribut autorisé
    disallowedTagsMode: "recursiveEscape", // Échappe plutôt que supprime
    selfClosing: [],
    parser: {
      decodeEntities: true, // Décode les entités HTML avant assainissement
    },
  });
};

/**
 * Assainit récursivement toutes les chaînes d'un objet
 * Parcourt les objets imbriqués, les valeurs non-string sont conservées telles quelles
 * @param {Object} obj - Objet à assainir
 * @returns {Object} Nouvel objet avec toutes les chaînes assainies
 */
export const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      sanitized[key] = sanitize(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      // Récursion pour les objets imbriqués
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};
