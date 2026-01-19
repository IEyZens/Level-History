import express from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", verifyToken, isAdmin, createEvent);
router.delete("/:id", verifyToken, isAdmin, deleteEvent);
router.put("/:id", verifyToken, isAdmin, updateEvent);

export default router;
