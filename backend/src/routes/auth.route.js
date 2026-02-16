import express from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.get("/me", verifyToken, me);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema),login);
router.post("/logout", logout);

export default router;
