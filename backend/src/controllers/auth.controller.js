import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import prisma from "../lib/prisma.js";
import { generateTokens } from "../utils/generateTokens.js";

/**
 * Inscription d'un nouvel utilisateur
 * Vérifie l'unicité de l'email, hache le mot de passe et génère les tokens
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hacher le mot de passe avant stockage
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const tokens = await generateTokens(user.id, user.role, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token: tokens.accessToken,
      },
    });
  } catch (error) {
    // P2002 = contrainte d'unicité Prisma (username ou email déjà pris)
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Username or Email already taken" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Connexion d'un utilisateur existant
 * Vérifie les identifiants et génère les tokens d'accès et de rafraîchissement
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Message d'erreur identique pour email et mot de passe (évite l'énumération)
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const tokens = await generateTokens(user.id, user.role, res);

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token: tokens.accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Déconnexion de l'utilisateur
 * Supprime le refresh token en base et efface les cookies d'authentification
 */
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      // Hacher le token avant de le chercher en base (stockage sécurisé)
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await prisma.refreshToken.delete({
        where: { token: tokenHash },
      });
    } catch (error) {
      // Erreur non bloquante : on déconnecte quand même l'utilisateur
    }
  }

  // Expirer les cookies côté client
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

/**
 * Récupère les informations de l'utilisateur connecté
 * Nécessite un token d'accès valide (middleware verifyToken)
 */
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Renouvelle le token d'accès à partir du refresh token
 * Implémente la rotation des refresh tokens (ancien supprimé, nouveau généré)
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Vérifier la signature et l'expiration du refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Refresh token expired" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid refresh token" });
      } else {
        throw error;
      }
    }

    // Vérifier que le token est bien de type refresh
    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    // Hacher le token pour le comparer à celui stocké en base
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    });

    if (!storedToken) {
      return res
        .status(401)
        .json({ error: "Refresh token not found or revoked" });
    }

    // Vérification supplémentaire de l'expiration en base
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      return res.status(401).json({ error: "Refresh token expired" });
    }

    // Rotation : supprimer l'ancien token avant d'en générer un nouveau
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const userId = decoded.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await generateTokens(user.id, user.role, res);

    return res.status(200).json({
      status: "success",
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
