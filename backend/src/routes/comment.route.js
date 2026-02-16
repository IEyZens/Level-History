import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByEvent,
  updateComment,
} from "../controllers/comment.controller.js";
import { checkOwnership } from "../middlewares/checkOwnership.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/comment.validator.js";

const router = express.Router();

router.get("/event/:id", getCommentsByEvent);
router.post(
  "/event/:id",
  verifyToken,
  validate(createCommentSchema),
  createComment,
);
router.put(
  "/:id",
  verifyToken,
  checkOwnership("comment"),
  validate(updateCommentSchema),
  updateComment,
);
router.delete("/:id", verifyToken, checkOwnership("comment"), deleteComment);

export default router;
