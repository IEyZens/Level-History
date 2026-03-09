/**
 * Middleware de restriction d'accès aux administrateurs
 * Doit être utilisé après le middleware verifyToken (req.userRole requis)
 */
export const isAdmin = (req, res, next) => {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only" });
  }

  next();
};
