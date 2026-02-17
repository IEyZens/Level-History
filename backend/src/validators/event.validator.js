import { z } from "zod";
import { sanitize } from "../utils/sanitize.js";

/**
 * Schema de validation pour la création d'un événement
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters")
    .transform((val) => sanitize(val)),

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
});

/**
 * Schema de validation pour la mise à jour d'un événement
 */
export const updateEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters")
    .optional(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters")
    .transform((val) => sanitize(val))
    .optional(),

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
});
