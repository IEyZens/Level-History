import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import prisma from "../lib/prisma.js";

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

export const generateTokens = async (userId, userRole, res) => {
  const accessPayload = { id: userId, role: userRole };
  const accessToken = jwt.sign(accessPayload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const accessMaxAge = parseDuration(config.JWT_EXPIRES_IN);

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: accessMaxAge,
    path: "/",
  });

  const refreshPayload = { id: userId, type: "refresh" };
  const refreshToken = jwt.sign(refreshPayload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });

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
      userId: userId,
      expiresAt: expiresAt,
    },
  });

  const refreshMaxAge = parseDuration(config.JWT_REFRESH_EXPIRES_IN);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: refreshMaxAge,
    path: "/",
  });

  await prisma.refreshToken.deleteMany({
    where: {
      userId: userId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return { accessToken, refreshToken };
};
