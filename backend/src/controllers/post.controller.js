import prisma from "../lib/prisma.js";

const createPost = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { content } = req.body;

    const authorId = req.userId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        authorId,
        eventId,
      },
    });

    res.status(201).json({
      data: {
        id: newPost.id,
        content: newPost.content,
        authorId: newPost.authorId,
        eventId: newPost.eventId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPostsByEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const eventById = await prisma.post.findMany({
      where: { eventId: Number(eventId) },
      include: {
        author: {
          select: { username: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(eventById);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const authorId = req.userId;
    const userRole = req.userRole;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (authorId !== post.authorId && userRole !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this post" });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { content } = req.body;
    const authorId = req.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (authorId !== post.authorId) {
      return res.status(403).json({ error: "Unauthorized to edit this post" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
      },
    });

    res.status(200).json({
      status: "success",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { createPost, deletePost, getPostsByEvent, updatePost };
