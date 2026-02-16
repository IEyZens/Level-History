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
      // Si c'est une erreur Zod
      if (error instanceof z.ZodError) {
        // Formater les erreurs pour le client
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
      }

      // Autre type d'erreur
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  };
};
