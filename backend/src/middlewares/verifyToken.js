import jwt from "jsonwebtoken";

/**
 * Middleware de vérification du token JWT d'accès
 * Extrait et valide le token depuis le cookie httpOnly "jwt"
 * Injecte req.userId et req.userRole pour les middlewares suivants
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const secretKey = process.env.JWT_SECRET;

  jwt.verify(token, secretKey, async (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid" });
    }

    // Rendre l'identité de l'utilisateur accessible aux middlewares suivants
    req.userId = payload.id;
    req.userRole = payload.role;

    next();
  });
};
