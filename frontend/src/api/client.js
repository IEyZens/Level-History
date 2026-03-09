const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Cache du module AuthContext pour éviter des imports répétés
let authStore = null;

/**
 * Charge le module AuthContext de manière lazy pour éviter les dépendances circulaires
 * @returns {Promise<Object>} Module AuthContext
 */
async function getAuthStore() {
  if (authStore) {
    return authStore;
  } else {
    const module = await import("../context/AuthContext");
    authStore = module;
  }

  return authStore;
}

/**
 * Tente de renouveler le token d'accès via le refresh token
 * @returns {Promise<boolean>} True si le renouvellement a réussi
 */
async function tryRefreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Client HTTP principal avec gestion automatique du renouvellement de token
 * En cas de 401, tente un refresh silencieux avant de réessayer la requête
 * Si le refresh échoue, déconnecte l'utilisateur et redirige vers /login
 * @param {string}  endpoint - Chemin de l'API (ex: "/events")
 * @param {Object}  options  - Options fetch (method, body, headers...)
 * @param {boolean} retry    - Autorise une nouvelle tentative après refresh (défaut: true)
 * @returns {Promise<Response>} Réponse fetch
 */
export default async function apiClient(endpoint, options = {}, retry = true) {
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      // Rejoue la requête originale avec le nouveau token
      return apiClient(endpoint, options, false);
    } else {
      // Refresh échoué — déconnexion forcée et redirection
      const store = await getAuthStore();
      store.clearUser();
      window.location.href = "/login";
      return res;
    }
  }

  return res;
}

/**
 * Raccourcis HTTP utilisant le client principal
 * Sérialisent automatiquement le body en JSON
 */
export const api = {
  get: (endpoint) => apiClient(endpoint),
  post: (endpoint, body) =>
    apiClient(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiClient(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint, body) =>
    apiClient(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint) => apiClient(endpoint, { method: "DELETE" }),
};
