import "dotenv/config";
import { z } from "zod";

/**
 * Schéma de validation des variables d'environnement
 * Vérifie la présence et le format de toutes les variables requises au démarrage
 */
const envSchema = z.object({
  // URL de connexion à la base de données PostgreSQL
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith("postgresql://"), {
      error: "DATABASE_URL must be a valid PostgreSQL connection string",
    }),

  // Secret utilisé pour signer les tokens JWT d'accès
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),

  // Durée de validité des tokens JWT d'accès (ex: 7d, 24h, 30m)
  JWT_EXPIRES_IN: z
    .string()
    .regex(
      /^\d+[dhms]$/,
      "JWT_EXPIRES_IN must be in format like '7d', '24h', '30m'",
    )
    .default("7d"),

  // Secret utilisé pour signer les tokens de rafraîchissement (doit différer de JWT_SECRET)
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters long")
    .refine((val, ctx) => val !== process.env.JWT_SECRET, {
      message: "JWT_REFRESH_SECRET must be different from JWT_SECRET",
    }),

  // Durée de validité des tokens de rafraîchissement
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(
      /^\d+[dhms]$/,
      "JWT_REFRESH_EXPIRES_IN must be in format like '7d', '24h', '30m'",
    )
    .default("7d"),

  // Port d'écoute du serveur (entre 1000 et 65535)
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1000).max(65535))
    .default("3000"),

  // Environnement d'exécution
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Liste des origines CORS autorisées, séparées par des virgules
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(",").map((origin) => origin.trim())),

  // Indique si les cookies doivent être transmis uniquement en HTTPS
  COOKIE_SECURE: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default("false"),
});

/**
 * Valide les variables d'environnement au démarrage du serveur
 * Arrête le processus si une variable est manquante ou invalide
 * @returns {Object} Variables d'environnement validées et transformées
 */
function validateEnv() {
  try {
    const validated = envSchema.parse(process.env);
    console.log("Environment validation successful");
    return validated;
  } catch (error) {
    console.error("Environment validation failed:");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (error instanceof z.ZodError) {
      // Affiche chaque erreur de validation avec le champ concerné
      error.issues.forEach((err) => {
        console.error(`${err.path.join(".")}: ${err.message}`);
      });
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Veuillez vérifier votre fichier .env");

    // Arrêt forcé du processus — la config est invalide
    process.exit(1);
  }
}

const config = validateEnv();

export default config;
