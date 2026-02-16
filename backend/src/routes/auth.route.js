import express from "express";
import {
  login,
  logout,
  me,
  refreshAccessToken,
  register,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.get("/me", verifyToken, me);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;
