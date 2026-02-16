import { z } from "zod";

/**
 * Schema de validation pour la création d'un commentaire
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(1000, "Content must not exceed 1000 characters")
    .trim(),
});

/**
 * Schema de validation pour la mise à jour d'un commentaire
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(1000, "Content must not exceed 1000 characters")
    .trim(),
});
