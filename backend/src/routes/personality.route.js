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

router.get("/", getAllPersonalities);
router.get("/:id", validateParams(idParamSchema), getPersonalityById);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  verifyFileType,
  validate(createPersonalitySchema),
  createPersonality,
);
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
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  validateParams(idParamSchema),
  deletePersonality,
);

export default router;
