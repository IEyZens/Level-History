import express from "express";
import { toggleLike } from "../controllers/like.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:id", verifyToken, toggleLike);

export default router;
