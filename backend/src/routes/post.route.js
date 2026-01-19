import express from "express";
import {
  createPost,
  deletePost,
  getPostsByEvent,
  updatePost,
} from "../controllers/post.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/event/:id", getPostsByEvent);
router.post("/event/:id", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
