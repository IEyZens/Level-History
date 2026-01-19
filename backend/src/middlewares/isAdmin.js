export const isAdmin = (req, res, next) => {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only" });
  }

  next();
};
