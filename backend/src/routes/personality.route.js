import express from "express";
import {
  createPersonality,
  deletePersonality,
  getAllPersonalities,
  getPersonalityById,
  updatePersonality,
} from "../controllers/personality.controller.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import upload, { verifyFileType } from "../middlewares/upload.js";
import { validate, validateParams } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { idParamSchema } from "../validators/params.validator.js";
import {
  createPersonalitySchema,
  updatePersonalitySchema,
} from "../validators/personality.validator.js";

const router = express.Router();

// Récupère toutes les personnalités
router.get("/", getAllPersonalities);

// Récupère une personnalité par son ID
router.get("/:id", validateParams(idParamSchema), getPersonalityById);

// Crée une nouvelle personnalité avec upload d'image (admin uniquement)
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  verifyFileType,
  validate(createPersonalitySchema),
  createPersonality,
);

// Met à jour une personnalité complète avec upload d'image optionnel (admin uniquement)
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  upload.single("image"),
  verifyFileType,
  validate(updatePersonalitySchema),
  updatePersonality,
);

// Met à jour partiellement une personnalité avec upload d'image optionnel (admin uniquement)
router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  upload.single("image"),
  verifyFileType,
  validate(updatePersonalitySchema),
  updatePersonality,
);

// Supprime une personnalité et son image associée (admin uniquement)
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  deletePersonality,
);

export default router;
