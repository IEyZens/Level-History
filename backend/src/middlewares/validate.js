import { z } from "zod";

/**
 * Middleware de validation avec Zod
 * @param {z.ZodSchema} schema - Le schéma Zod à valider
 * @returns {Function} Middleware Express
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Valider req.body avec le schéma
      const validated = schema.parse(req.body);

      // Remplacer req.body par les données validées et transformées
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors });
      }

      // Ajoute ce log pour voir la vraie erreur :
      console.error("Validate middleware non-Zod error:", error);

      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);

      req.params = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Invalid route parameter",
          details: errors,
        });
      }

      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);

      req.query = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Invalid query parameter",
          details: errors,
        });
      }

      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
