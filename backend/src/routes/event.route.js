import express from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validate, validateParams } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event.validator.js";
import { idParamSchema } from "../validators/params.validator.js";

const router = express.Router();

// Récupère tous les événements
router.get("/", getEvents);

// Récupère un événement par son ID
router.get("/:id", validateParams(idParamSchema), getEventById);

// Crée un nouvel événement (admin uniquement)
router.post(
  "/",
  verifyToken,
  isAdmin,
  validate(createEventSchema),
  createEvent,
);

// Met à jour un événement complet (admin uniquement)
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  validate(updateEventSchema),
  updateEvent,
);

// Met à jour partiellement un événement (admin uniquement)
router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  validate(updateEventSchema),
  updateEvent,
);

// Supprime un événement (admin uniquement)
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  deleteEvent,
);

export default router;
