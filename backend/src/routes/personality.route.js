import express from "express";
import {
  createPersonality,
  deletePersonality,
  getAllPersonalities,
  getPersonalityById,
  updatePersonality,
} from "../controllers/personality.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getAllPersonalities);
router.get("/:id", getPersonalityById);
router.post("/", verifyToken, createPersonality);
router.put("/:id", verifyToken, updatePersonality);
router.delete("/:id", verifyToken, deletePersonality);

export default router;
