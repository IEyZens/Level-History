import { api } from "./client";

/**
 * Récupère tous les commentaires d'un événement
 * @param {number} eventId - ID de l'événement
 * @returns {Promise<Array>} Liste des commentaires avec auteur et nombre de likes
 */
export async function getCommentsByEvent(eventId) {
  const res = await api.get(`/comments/event/${eventId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching comments");
  } else {
    return data;
  }
}

/**
 * Crée un nouveau commentaire sur un événement
 * @param {number} eventId - ID de l'événement
 * @param {string} content - Contenu du commentaire
 * @returns {Promise<Object>} Commentaire créé
 */
export async function createComment(eventId, content) {
  const res = await api.post(`/comments/event/${eventId}`, { content });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error creating comment");
  } else {
    return data;
  }
}

/**
 * Met à jour le contenu d'un commentaire existant
 * @param {number} id      - ID du commentaire
 * @param {string} content - Nouveau contenu
 * @returns {Promise<Object>} Commentaire mis à jour
 */
export async function updateComment(id, content) {
  const res = await api.put(`/comments/${id}`, { content });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error updating comment");
  } else {
    return data;
  }
}

/**
 * Supprime un commentaire par son ID
 * @param {number} id - ID du commentaire
 * @returns {Promise<Object>} Message de confirmation
 */
export async function deleteComment(id) {
  const res = await api.delete(`/comments/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error deleting comment");
  } else {
    return data;
  }
}
