import express from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/me", verifyToken, me);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
