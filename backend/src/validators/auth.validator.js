import { z } from "zod";

/**
 * Schema de validation pour l'inscription
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores and hyphens",
    ),

  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
});

/**
 * Schema de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z.string().min(1, "Password is required"),
});
