import { z } from "zod";
import { sanitize } from "../utils/sanitize.js";

/**
 * Schema de validation pour la création d'une personnalité
 */
export const createPersonalitySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  biography: z
    .string()
    .min(10, "Bio must be at least 10 characters long")
    .max(2000, "Bio must not exceed 2000 characters")
    .transform((val) => sanitize(val)),

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
 * Schema de validation pour la mise à jour d'une personnalité
 */
export const updatePersonalitySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .optional(),

  biography: z
    .string()
    .min(10, "Bio must be at least 10 characters long")
    .max(2000, "Bio must not exceed 2000 characters")
    .transform((val) => sanitize(val))
    .optional(),

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
