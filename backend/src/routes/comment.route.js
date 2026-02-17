import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByEvent,
  updateComment,
} from "../controllers/comment.controller.js";
import { checkOwnership } from "../middlewares/checkOwnership.js";
import { validate, validateParams } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/comment.validator.js";
import { idParamSchema } from "../validators/params.validator.js";

const router = express.Router();

router.get("/event/:id", validateParams(idParamSchema), getCommentsByEvent);
router.post(
  "/event/:id",
  verifyToken,
  validateParams(idParamSchema),
  validate(createCommentSchema),
  createComment,
);
router.put(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  checkOwnership("comment"),
  validate(updateCommentSchema),
  updateComment,
);
router.delete(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  checkOwnership("comment"),
  deleteComment,
);

export default router;
