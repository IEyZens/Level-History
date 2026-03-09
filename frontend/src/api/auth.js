import { api } from "./client";

/**
 * Inscrit un nouvel utilisateur
 * @param {{ username: string, email: string, password: string }} credentials
 * @returns {Promise<Object>} Données de l'utilisateur créé avec son token
 */
export async function register({ username, email, password }) {
  const res = await api.post("/auth/register", { username, email, password });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error during registration");
  } else {
    return data;
  }
}

/**
 * Connecte un utilisateur et pose les cookies de session
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<Object>} Données de l'utilisateur avec son token d'accès
 */
export async function login({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Incorrect email or password");
  } else {
    return data;
  }
}

/**
 * Déconnecte l'utilisateur et invalide les cookies de session
 * @returns {Promise<boolean>} True si la déconnexion a réussi
 */
export async function logout() {
  const res = await api.post("/auth/logout");

  if (!res.ok) {
    throw new Error("Error during logout");
  } else {
    return true;
  }
}

/**
 * Récupère les informations de l'utilisateur connecté
 * Retourne null si l'utilisateur n'est pas authentifié (401) ou en cas d'erreur
 * @returns {Promise<Object|null>} Données de l'utilisateur ou null
 */
export async function getMe() {
  const res = await api.get("/auth/me");

  // Non authentifié — retourne null sans lever d'erreur
  if (res.status === 401) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    return null;
  } else {
    return data.data;
  }
}
