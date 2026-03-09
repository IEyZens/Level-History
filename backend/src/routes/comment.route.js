import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByEvent,
  updateComment,
} from "../controllers/comment.controller.js";
import { checkOwnership } from "../middlewares/checkOwnership.js";
import { validate, validateParams } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/comment.validator.js";
import { idParamSchema } from "../validators/params.validator.js";

const router = express.Router();

// Récupère tous les commentaires d'un événement
router.get("/event/:id", validateParams(idParamSchema), getCommentsByEvent);

// Crée un commentaire sur un événement (authentification requise)
router.post(
  "/event/:id",
  verifyToken,
  validateParams(idParamSchema),
  validate(createCommentSchema),
  createComment,
);

// Met à jour un commentaire (authentification + propriété requises)
router.put(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  checkOwnership("comment"),
  validate(updateCommentSchema),
  updateComment,
);

// Supprime un commentaire (authentification + propriété requises)
router.delete(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  checkOwnership("comment"),
  deleteComment,
);

export default router;
