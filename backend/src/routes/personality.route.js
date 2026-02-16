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
import { validate } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createPersonalitySchema,
  updatePersonalitySchema,
} from "../validators/personality.validator.js";

const router = express.Router();

router.get("/", getAllPersonalities);
router.get("/:id", getPersonalityById);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validate(createPersonalitySchema),
  createPersonality,
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validate(updatePersonalitySchema),
  updatePersonality,
);
router.delete("/:id", verifyToken, isAdmin, deletePersonality);

export default router;
