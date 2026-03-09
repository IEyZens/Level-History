import { api } from "./client";

/**
 * Récupère tous les événements triés par date croissante
 * @returns {Promise<Array>} Liste de tous les événements
 */
export async function getEvents() {
  const res = await api.get("/events");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching events");
  } else {
    return data;
  }
}

/**
 * Récupère un événement par son ID avec ses likes et commentaires
 * @param {number} id - ID de l'événement
 * @returns {Promise<Object>} Données de l'événement
 */
export async function getEventById(id) {
  const res = await api.get(`/events/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Event not found");
  } else {
    return data;
  }
}

/**
 * Crée un nouvel événement (admin uniquement)
 * @param {{ title: string, description: string, date: string, image?: string, category?: string }} fields
 * @returns {Promise<Object>} Événement créé
 */
export async function createEvent({
  title,
  description,
  date,
  image,
  category,
}) {
  const res = await api.post("/events", {
    title,
    description,
    date,
    image,
    category,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error creating event");
  } else {
    return data;
  }
}

/**
 * Met à jour partiellement un événement existant (admin uniquement)
 * @param {number} id     - ID de l'événement
 * @param {Object} fields - Champs à mettre à jour
 * @returns {Promise<Object>} Événement mis à jour
 */
export async function updateEvent(id, fields) {
  const res = await api.patch(`/events/${id}`, fields);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error updating event");
  } else {
    return data;
  }
}

/**
 * Supprime un événement par son ID (admin uniquement)
 * @param {number} id - ID de l'événement
 * @returns {Promise<Object>} Message de confirmation
 */
export async function deleteEvent(id) {
  const res = await api.delete(`/events/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error deleting event");
  } else {
    return data;
  }
}
