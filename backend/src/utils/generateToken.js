import jwt from "jsonwebtoken";
import config from "../config/env.js";

/**
 * Parse duration string to milliseconds
 * @param {string} duration - Duration string like "7d", "24h", "30m", "60s"
 * @returns {number} Duration in milliseconds
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
    d: 24 * 60 * 60 * 1000, // days
    h: 60 * 60 * 1000, // hours
    m: 60 * 1000, // minutes
    s: 1000, // seconds
  };

  return value * multipliers[unit];
}

export const generateToken = (userId, userRole, res) => {
  const payload = { id: userId, role: userRole };
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const maxAge = parseDuration(config.JWT_EXPIRES_IN);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: maxAge,
    path: "/",
  });

  return token;
};
