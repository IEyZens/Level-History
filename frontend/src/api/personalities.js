import { api } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Récupère toutes les personnalités triées par nom alphabétique
 * @returns {Promise<Array>} Liste de toutes les personnalités
 */
export async function getPersonalities() {
  const res = await api.get("/personalities");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching personalities");
  } else {
    return data;
  }
}

/**
 * Récupère une personnalité par son ID
 * @param {number} id - ID de la personnalité
 * @returns {Promise<Object>} Données de la personnalité
 */
export async function getPersonalityById(id) {
  const res = await api.get(`/personalities/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Personality not found");
  } else {
    return data;
  }
}

/**
 * Crée une nouvelle personnalité avec upload d'image (admin uniquement)
 * Utilise fetch directement car le body est un FormData (pas du JSON)
 * @param {FormData} formData - Données du formulaire incluant l'image
 * @returns {Promise<Object>} Personnalité créée
 */
export async function createPersonality(formData) {
  const res = await fetch(`${BASE_URL}/personalities`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error creating personality");
  return json;
}

/**
 * Met à jour une personnalité existante avec upload d'image optionnel (admin uniquement)
 * Utilise fetch directement car le body est un FormData (pas du JSON)
 * @param {number}   id       - ID de la personnalité
 * @param {FormData} formData - Données du formulaire avec image optionnelle
 * @returns {Promise<Object>} Personnalité mise à jour
 */
export async function updatePersonality(id, formData) {
  const res = await fetch(`${BASE_URL}/personalities/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error updating personality");
  return json;
}

/**
 * Supprime une personnalité et son image associée (admin uniquement)
 * @param {number} id - ID de la personnalité
 * @returns {Promise<Object>} Message de confirmation
 */
export async function deletePersonality(id) {
  const res = await api.delete(`/personalities/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error deleting personality");
  } else {
    return data;
  }
}
