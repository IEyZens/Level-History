import express from "express";
import {
  createPersonality,
  deletePersonality,
  getAllPersonalities,
  getPersonalityById,
  updatePersonality,
} from "../controllers/personality.controller.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getAllPersonalities);
router.get("/:id", getPersonalityById);

router.post("/", verifyToken, upload.single("image"), createPersonality);
router.put("/:id", verifyToken, upload.single("image"), updatePersonality);
router.delete("/:id", verifyToken, deletePersonality);

export default router;
