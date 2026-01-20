import prisma from "../lib/prisma.js";

const createComment = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { content } = req.body;

    const authorId = req.userId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        authorId,
        eventId,
      },
    });

    res.status(201).json({
      data: {
        id: newComment.id,
        content: newComment.content,
        authorId: newComment.authorId,
        eventId: newComment.eventId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCommentsByEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const eventById = await prisma.comment.findMany({
      where: { eventId: Number(eventId) },
      include: {
        author: {
          select: { username: true, role: true },
        },
        _count: {
          select: { likes: true },
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

const deleteComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const authorId = req.userId;
    const userRole = req.userRole;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (authorId !== comment.authorId && userRole !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const { content } = req.body;
    const authorId = req.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (authorId !== comment.authorId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this comment" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
      },
    });

    res.status(200).json({
      status: "success",
      data: updatedComment,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { createComment, deleteComment, getCommentsByEvent, updateComment };
