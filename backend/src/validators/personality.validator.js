import { z } from "zod";
import { sanitize } from "../utils/sanitize.js";

/**
 * Schéma de validation pour la création d'une personnalité
 * La biographie est assainie, les liens sociaux acceptent les chaînes vides (converties en undefined)
 */
export const createPersonalitySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  // Supprime tout HTML injecté avant persistance
  biography: z
    .string()
    .min(10, "Bio must be at least 10 characters long")
    .max(2000, "Bio must not exceed 2000 characters")
    .transform((val) => sanitize(val)),

  // Accepte toute chaîne parseable par Date et la convertit en objet Date
  birthDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val))
    .optional(),

  image: z.string().optional(),

  nationality: z
    .string()
    .min(2, "Nationality must be at least 2 characters long")
    .max(100, "Nationality must not exceed 100 characters")
    .optional(),

  role: z
    .string()
    .min(2, "Role must be at least 2 characters long")
    .max(100, "Role must not exceed 100 characters")
    .optional(),

  // Les chaînes vides sont converties en undefined pour éviter les erreurs d'URL
  twitter: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("Twitter must be a valid URL").optional().nullable(),
  ),
  linkedin: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("LinkedIn must be a valid URL").optional().nullable(),
  ),
  website: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("Website must be a valid URL").optional().nullable(),
  ),
});

/**
 * Schéma de validation pour la mise à jour d'une personnalité
 * Tous les champs sont optionnels — seuls les champs fournis sont mis à jour
 */
export const updatePersonalitySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .optional(),

  // Supprime tout HTML injecté avant persistance
  biography: z
    .string()
    .min(10, "Bio must be at least 10 characters long")
    .max(2000, "Bio must not exceed 2000 characters")
    .transform((val) => sanitize(val))
    .optional(),

  // Accepte toute chaîne parseable par Date et la convertit en objet Date
  birthDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val))
    .optional(),

  nationality: z
    .string()
    .min(2, "Nationality must be at least 2 characters long")
    .max(100, "Nationality must not exceed 100 characters")
    .optional(),

  role: z
    .string()
    .min(2, "Role must be at least 2 characters long")
    .max(100, "Role must not exceed 100 characters")
    .optional(),

  // Les chaînes vides sont converties en undefined pour éviter les erreurs d'URL
  twitter: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("Twitter must be a valid URL").optional().nullable(),
  ),
  linkedin: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("LinkedIn must be a valid URL").optional().nullable(),
  ),
  website: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("Website must be a valid URL").optional().nullable(),
  ),
});
