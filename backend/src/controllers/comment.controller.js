import prisma from "../lib/prisma.js";

export const createComment = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { content } = req.body;
    const authorId = req.userId;

    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid Event ID format" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }

    if (!authorId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        authorId,
        eventId,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        id: newComment.id,
        content: newComment.content,
        authorId: newComment.authorId,
        eventId: newComment.eventId,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2003") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCommentsByEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid Event ID format" });
    }

    const comments = await prisma.comment.findMany({
      where: { eventId },
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

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const authorId = req.userId;
    const userRole = req.userRole;

    if (isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid Comment ID format" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const { content } = req.body;

    if (isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid Comment ID format" });
    }

    if (!content || content.trim() === "") {
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
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
