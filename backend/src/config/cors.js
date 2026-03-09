/**
 * Génère la configuration CORS selon les origines autorisées et l'environnement
 * @param {string[]} allowedOrigins - Liste des origines autorisées
 * @param {string} env - Environnement actuel (test, development, production)
 * @returns {Object} Configuration CORS pour Express
 */
export const getCorsConfig = (allowedOrigins, env) => {
  return {
    origin: (origin, callback) => {
      // Toujours autoriser en environnement de test
      if (env === "test") {
        return callback(null, true);
      }

      // Pas d'origine (Postman, curl, etc.)
      if (!origin) {
        // Autoriser en développement, bloquer en production
        if (env === "development") {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      }

      // Vérifier si l'origine est dans la liste autorisée
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 heures
  };
};
