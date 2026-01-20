import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByEvent,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/event/:id", getCommentsByEvent);
router.post("/event/:id", verifyToken, createComment);
router.put("/:id", verifyToken, updateComment);
router.delete("/:id", verifyToken, deleteComment);

export default router;
