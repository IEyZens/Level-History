import jwt from "jsonwebtoken";
import config from "../config/env.js";

/**
 * Convertit une chaîne de durée en millisecondes
 * @param {string} duration - Durée au format "7d", "24h", "30m" ou "60s"
 * @returns {number} Durée en millisecondes
 */
function parseDuration(duration) {
  const regex = /^(\d+)([dhms])$/;
  const match = duration.match(regex);

  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    d: 24 * 60 * 60 * 1000, // jours
    h: 60 * 60 * 1000, // heures
    m: 60 * 1000, // minutes
    s: 1000, // secondes
  };

  return value * multipliers[unit];
}

/**
 * Génère un token JWT d'accès et le pose en cookie httpOnly
 * @param {number} userId   - ID de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur (USER | ADMIN)
 * @param {Object} res      - Objet réponse Express
 * @returns {string} Token JWT signé
 */
export const generateToken = (userId, userRole, res) => {
  const payload = { id: userId, role: userRole };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  // Convertir la durée en ms pour l'option maxAge du cookie
  const maxAge = parseDuration(config.JWT_EXPIRES_IN);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    // SameSite strict en production pour limiter les attaques CSRF
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
    maxAge,
    path: "/",
  });

  return token;
};
