import { z } from "zod";
import { sanitize } from "../utils/sanitize.js";

/**
 * Schéma de validation pour la création d'un événement
 * La description est assainie, la date est transformée en objet Date
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters"),

  // Supprime tout HTML injecté avant persistance
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters")
    .transform((val) => sanitize(val)),

  // Accepte toute chaîne parseable par Date et la convertit en objet Date
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val)),

  category: z
    .enum([
      "CONSOLE_RELEASE",
      "GAME_RELEASE",
      "COMPANY_FOUNDING",
      "TECHNOLOGY",
      "CULTURAL_IMPACT",
      "OTHER",
    ])
    .optional(),

  // Une chaîne vide est convertie en null, sinon doit être une URL valide
  image: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().url("Image must be a valid URL").optional().nullable())
    .optional()
    .nullable(),
});

/**
 * Schéma de validation pour la mise à jour d'un événement
 * Tous les champs sont optionnels — seuls les champs fournis sont mis à jour
 */
export const updateEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters")
    .optional(),

  // Supprime tout HTML injecté avant persistance
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters")
    .transform((val) => sanitize(val))
    .optional(),

  // Accepte toute chaîne parseable par Date et la convertit en objet Date
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val))
    .optional(),

  category: z
    .enum([
      "CONSOLE_RELEASE",
      "GAME_RELEASE",
      "COMPANY_FOUNDING",
      "TECHNOLOGY",
      "CULTURAL_IMPACT",
      "OTHER",
    ])
    .optional(),

  // Une chaîne vide est convertie en null, sinon doit être une URL valide
  image: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().url("Image must be a valid URL").optional().nullable())
    .optional()
    .nullable(),
});
