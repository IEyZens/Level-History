import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import prisma from "../lib/prisma.js";

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
 * Génère un token d'accès et un refresh token, les pose en cookies httpOnly
 * et persiste le refresh token haché en base avec sa date d'expiration
 * Nettoie également les refresh tokens expirés de l'utilisateur
 * @param {number} userId   - ID de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur (USER | ADMIN)
 * @param {Object} res      - Objet réponse Express
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokens = async (userId, userRole, res) => {
  // ── Token d'accès ────────────────────────────────────────────────────────────

  const accessPayload = { id: userId, role: userRole };
  const accessToken = jwt.sign(accessPayload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    // SameSite strict en production pour limiter les attaques CSRF
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseDuration(config.JWT_EXPIRES_IN),
    path: "/",
  });

  // ── Refresh token ────────────────────────────────────────────────────────────

  const refreshPayload = { id: userId, type: "refresh" };
  const refreshToken = jwt.sign(refreshPayload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });

  // Stocker uniquement le hash en base (le token brut ne doit pas être persisté)
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + parseDuration(config.JWT_REFRESH_EXPIRES_IN),
  );

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId,
      expiresAt,
    },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseDuration(config.JWT_REFRESH_EXPIRES_IN),
    path: "/",
  });

  // Purger les refresh tokens expirés de cet utilisateur après chaque connexion
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  });

  return { accessToken, refreshToken };
};
