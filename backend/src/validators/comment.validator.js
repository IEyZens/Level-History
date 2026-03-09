import { z } from "zod";
import { sanitize } from "../utils/sanitize.js";

/**
 * Schéma de validation pour la création d'un commentaire
 * Le contenu est nettoyé des balises HTML avant persistance
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(1000, "Content must not exceed 1000 characters")
    .trim()
    .transform((val) => sanitize(val)), // Supprime tout HTML injecté
});

/**
 * Schéma de validation pour la mise à jour d'un commentaire
 * Mêmes règles que pour la création
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(1000, "Content must not exceed 1000 characters")
    .trim()
    .transform((val) => sanitize(val)), // Supprime tout HTML injecté
});
