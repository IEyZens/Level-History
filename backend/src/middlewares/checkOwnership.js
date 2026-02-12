import prisma from "../lib/prisma.js";

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

      if (adminBypass === true && userRole === "ADMIN") {
        return next();
      }

      const resource = await prisma[model].findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        return res.status(404).json({ error: "[Model] not found" });
      }

      if (resource[ownerField] !== req.userId) {
        return res.status(403).json({
          error: "You do not have permission to modify this resource",
        });
      }

      next();
    } catch (error) {
      console.error(error);

      if (error.code === "P2025") {
        return res.status(404).json({
          error: `${model.charAt(0).toUpperCase() + model.slice(1)} not found`,
        });
      }

      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
