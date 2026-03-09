import { z } from "zod";

/**
 * Schéma de validation pour la mise à jour du profil de l'utilisateur connecté
 * Tous les champs sont optionnels — seuls les champs fournis sont mis à jour
 */
export const updateMeSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  // URL de l'avatar ou null pour le supprimer
  avatar: z.string().url().optional().nullable(),
});
