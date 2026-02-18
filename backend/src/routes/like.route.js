import express from "express";
import { toggleLike } from "../controllers/like.controller.js";
import { validateParams } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { likeParamsSchema } from "../validators/params.validator.js";

const router = express.Router();

router.post(
  "/:type/:id",
  verifyToken,
  validateParams(likeParamsSchema),
  toggleLike,
);

export default router;
