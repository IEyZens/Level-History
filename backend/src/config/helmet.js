/**
 * Génère la configuration Helmet selon l'environnement
 * @param {string} env - Environnement actuel (development, production, test)
 * @returns {Object} Configuration Helmet pour Express
 */
export const getHelmetConfig = (env) => {
  const isProduction = env === "production";
  const isDevelopment = env === "development" || env === "test";

  return {
    contentSecurityPolicy: {
      directives: {
        // Autorise uniquement les ressources de la même origine par défaut
        defaultSrc: ["'self'"],
        // Autorise eval() en développement (nécessaire pour Vite HMR)
        scriptSrc: ["'self'", ...(isDevelopment ? ["'unsafe-eval'"] : [])],
        // Autorise les styles inline (nécessaire pour certaines librairies)
        styleSrc: ["'self'", "'unsafe-inline'"],
        // Autorise les images locales, en base64 et depuis HTTPS
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        // Autorise les connexions WebSocket en développement (Vite HMR)
        connectSrc: ["'self'", ...(isDevelopment ? ["ws:", "wss:"] : [])],
        // Interdit l'intégration dans des iframes
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    // HSTS activé uniquement en production
    strictTransportSecurity: isProduction
      ? {
          maxAge: 31536000, // 1 an en secondes
          includeSubDomains: true,
          preload: true,
        }
      : false,
    // Interdit l'intégration de la page dans des frames
    xFrameOptions: {
      action: "deny",
    },
    // Désactive la pré-résolution DNS pour limiter les fuites d'information
    xDnsPrefetchControl: {
      allow: false,
    },
    // Interdit le chargement de ressources cross-domain par des plugins Flash/PDF
    xPermittedCrossDomainPolicies: {
      permittedPolicies: "none",
    },
    // Envoie l'origine uniquement pour les requêtes cross-origin vers HTTPS
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  };
};
