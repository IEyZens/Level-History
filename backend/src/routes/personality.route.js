import express from "express";
import {
  createPersonality,
  deletePersonality,
  getAllPersonalities,
  getPersonalityById,
  updatePersonality,
} from "../controllers/personality.controller.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getAllPersonalities);
router.get("/:id", getPersonalityById);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  createPersonality,
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  updatePersonality,
);
router.delete("/:id", verifyToken, isAdmin, deletePersonality);

export default router;
