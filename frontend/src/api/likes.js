import { api } from "./client";

/**
 * Bascule le like d'un utilisateur sur un événement ou un commentaire
 * Premier appel → like, deuxième appel → unlike
 * @param {"event"|"comment"} type - Type de la cible
 * @param {number} id              - ID de la cible
 * @returns {Promise<Object>} Message de confirmation
 */
export async function toggleLike(type, id) {
  const res = await api.post(`/likes/${type}/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error toggling like");
  } else {
    return data;
  }
}
