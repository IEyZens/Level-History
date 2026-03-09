import prisma from "../lib/prisma.js";

/**
 * Middleware de vérification de propriété d'une ressource
 * Vérifie que l'utilisateur connecté est bien le propriétaire de la ressource ciblée
 * @param {string} model       - Nom du modèle Prisma (ex: "comment", "event")
 * @param {Object} options
 * @param {string} options.paramName   - Nom du paramètre de route contenant l'ID (défaut: "id")
 * @param {string} options.ownerField  - Champ de propriété dans le modèle (défaut: "authorId")
 * @param {boolean} options.adminBypass - Les admins contournent la vérification (défaut: true)
 */
export const checkOwnership = (model, options = {}) => {
  return async (req, res, next) => {
    try {
      const paramName = options.paramName || "id";
      const ownerField = options.ownerField || "authorId";
      const adminBypass = options.adminBypass !== false;
      const userId = req.userId;
      const userRole = req.userRole;

      const resourceId = Number(req.params[paramName]);
      if (isNaN(resourceId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Les admins ont accès à toutes les ressources si adminBypass est activé
      if (adminBypass === true && userRole === "ADMIN") {
        return next();
      }

      const resource = await prisma[model].findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        return res.status(404).json({ error: "[Model] not found" });
      }

      // Vérifier que l'utilisateur connecté est bien le propriétaire
      if (resource[ownerField] !== userId) {
        return res.status(403).json({
          error: "You do not have permission to modify this resource",
        });
      }

      next();
    } catch (error) {
      // P2025 = enregistrement introuvable
      if (error.code === "P2025") {
        return res.status(404).json({
          error: `${model.charAt(0).toUpperCase() + model.slice(1)} not found`,
        });
      }

      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
