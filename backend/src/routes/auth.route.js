import express from "express";
import {
  login,
  logout,
  me,
  refreshAccessToken,
  register,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = express.Router();

// Récupère les informations de l'utilisateur connecté
router.get("/me", verifyToken, me);

// Inscription d'un nouvel utilisateur
router.post("/register", validate(registerSchema), register);

// Connexion avec email et mot de passe
router.post("/login", validate(loginSchema), login);

// Renouvellement du token d'accès via le refresh token
router.post("/refresh", refreshAccessToken);

// Déconnexion et invalidation des tokens
router.post("/logout", logout);

export default router;
