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

router.get("/", getEvents);
router.get("/:id", validateParams(idParamSchema), getEventById);
router.post(
  "/",
  verifyToken,
  isAdmin,
  validate(createEventSchema),
  createEvent,
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  validate(updateEventSchema),
  updateEvent,
);
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  deleteEvent,
);

export default router;
