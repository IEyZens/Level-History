import { z } from "zod";

/**
 * Middleware de validation du corps de la requête avec Zod
 * Remplace req.body par les données validées et transformées par le schéma
 * @param {z.ZodSchema} schema - Le schéma Zod à appliquer
 * @returns {Function} Middleware Express
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

/**
 * Middleware de validation des paramètres de route avec Zod
 * Remplace req.params par les données validées et transformées par le schéma
 * @param {z.ZodSchema} schema - Le schéma Zod à appliquer
 * @returns {Function} Middleware Express
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
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

/**
 * Middleware de validation des paramètres de requête (query string) avec Zod
 * Remplace req.query par les données validées et transformées par le schéma
 * @param {z.ZodSchema} schema - Le schéma Zod à appliquer
 * @returns {Function} Middleware Express
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
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
