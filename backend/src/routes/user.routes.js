import express from "express";
import {
  getAdminStats,
  getMe,
  updateMe,
} from "../controllers/user.controller.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { updateMeSchema } from "../validators/user.validator.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, validate(updateMeSchema), updateMe);
router.get("/stats", verifyToken, isAdmin, getAdminStats);

export default router;
