import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith("postgresql://"), {
      message: "DATABASE_URL must be a valid PostgreSQL connection string",
    }),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),

  JWT_EXPIRES_IN: z
    .string()
    .regex(
      /^\d+[dhms]$/,
      "JWT_EXPIRES_IN must be in format like '7d', '24h', '30m'",
    )
    .default("7d"),

  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1000).max(65535))
    .default("3000"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(",").map((origin) => origin.trim())),

  COOKIE_SECURE: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default("false"),
});

function validateEnv() {
  try {
    const validated = envSchema.parse(process.env);

    console.log("Environment validation successful");

    return validated;
  } catch (error) {
    console.error("Environment validation failed:");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`${err.path.join(".")}: ${err.message}`);
      });
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Please check your .env file");

    process.exit(1);
  }
}

const config = validateEnv();

export default config;
