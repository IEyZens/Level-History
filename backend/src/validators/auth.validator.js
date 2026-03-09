import { z } from "zod";

/**
 * Schéma de validation pour l'inscription
 * Vérifie le format du nom d'utilisateur, de l'email et la longueur du mot de passe
 */
export const registerSchema = z.object({
  // Lettres, chiffres, underscores et tirets uniquement
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
 * Schéma de validation pour la connexion
 * Validation minimale — l'authentification est gérée dans le contrôleur
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),

  // Vérifie uniquement la présence du mot de passe
  password: z.string().min(1, "Password is required"),
});
