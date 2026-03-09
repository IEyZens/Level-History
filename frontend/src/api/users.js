import { api } from "./client";

/**
 * Récupère le profil complet de l'utilisateur connecté
 * Inclut ses commentaires, événements likés et compteurs
 * Retourne null si non authentifié (401) ou en cas d'erreur
 * @returns {Promise<Object|null>} Profil de l'utilisateur ou null
 */
export async function getMyProfile() {
  const res = await api.get("/users/me");

  // Non authentifié — retourne null sans lever d'erreur
  if (res.status === 401) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    return null;
  } else {
    return data;
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté
 * Seuls les champs fournis sont mis à jour (mise à jour partielle)
 * @param {Object} fields - Champs à mettre à jour (username, email, avatar, password)
 * @returns {Promise<Object>} Profil mis à jour
 */
export async function updateMyProfile(fields) {
  const res = await api.put("/users/me", fields);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error updating profile");
  } else {
    return data;
  }
}

/**
 * Récupère les statistiques globales pour le tableau de bord admin
 * @returns {Promise<{ users: number, events: number, comments: number, likes: number }>}
 */
export async function getAdminStats() {
  const res = await api.get("/users/stats");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching stats");
  } else {
    return data;
  }
}

/**
 * Récupère la liste complète des utilisateurs (admin uniquement)
 * @returns {Promise<Array>} Liste des utilisateurs avec leurs compteurs
 */
export async function getAllUsers() {
  const res = await api.get("/users");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error fetching users");
  return data;
}

/**
 * Met à jour un utilisateur par son ID (admin uniquement)
 * @param {number} id     - ID de l'utilisateur
 * @param {Object} fields - Champs à mettre à jour (username, email, avatar, role)
 * @returns {Promise<Object>} Utilisateur mis à jour
 */
export async function updateUser(id, fields) {
  const res = await api.patch(`/users/${id}`, fields);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error updating user");
  return data;
}

/**
 * Supprime un utilisateur par son ID (admin uniquement)
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<boolean>} True si la suppression a réussi
 */
export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Error deleting user");
  }
  return true;
}
