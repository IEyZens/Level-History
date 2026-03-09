import express from "express";
import {
  deleteUser,
  getAdminStats,
  getAllUsers,
  getMe,
  updateMe,
  updateUser,
} from "../controllers/user.controller.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { updateMeSchema } from "../validators/user.validator.js";

const router = express.Router();

// Récupère le profil complet de l'utilisateur connecté
router.get("/me", verifyToken, getMe);

// Met à jour le profil de l'utilisateur connecté
router.put("/me", verifyToken, validate(updateMeSchema), updateMe);

// Récupère les statistiques globales (admin uniquement)
router.get("/stats", verifyToken, isAdmin, getAdminStats);

// Récupère la liste de tous les utilisateurs (admin uniquement)
router.get("/", verifyToken, isAdmin, getAllUsers);

// Met à jour un utilisateur par son ID (admin uniquement)
router.patch("/:id", verifyToken, isAdmin, updateUser);

// Supprime un utilisateur par son ID (admin uniquement)
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
