import { z } from "zod";

/**
 * Schéma de validation pour les paramètres de route contenant un ID numérique
 * Vérifie que l'ID est un entier positif et le transforme en nombre
 */
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "ID must be greater than 0" }),
});

/**
 * Schéma de validation pour les paramètres de route des likes
 * Vérifie que le type est "event" ou "comment" et que l'ID est un entier positif
 */
export const likeParamsSchema = z.object({
  type: z.enum(["event", "comment"], {
    errorMap: () => ({ message: 'Type must be "event" or "comment"' }),
  }),

  id: z
    .string()
    .regex(/^\d+$/, "ID must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "ID must be a greater than 0" }),
});

/**
 * Schéma de validation pour les paramètres de pagination en query string
 * Tous les champs sont optionnels — des valeurs par défaut sont appliquées
 */
export const paginationQuerySchema = z.object({
  // Numéro de page (défaut : 1)
  page: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, "Page must be at least 1")
    .default(1)
    .optional(),

  // Nombre de résultats par page, entre 1 et 100 (défaut : 10)
  limit: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val >= 1 && val <= 100, {
      message: "Limit must be between 1 and 100",
    })
    .default(10)
    .optional(),

  // Champ de tri autorisé
  sortBy: z.enum(["createdAt", "date", "title", "name"]).optional(),

  // Ordre de tri (défaut : asc)
  order: z.enum(["asc", "desc"]).default("asc"),
});
