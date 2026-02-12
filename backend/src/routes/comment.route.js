import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByEvent,
  updateComment,
} from "../controllers/comment.controller.js";
import { checkOwnership } from "../middlewares/checkOwnership.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/event/:id", getCommentsByEvent);
router.post("/event/:id", verifyToken, createComment);
router.put("/:id", verifyToken, checkOwnership("comment"), updateComment);
router.delete("/:id", verifyToken, checkOwnership("comment"), deleteComment);

export default router;
