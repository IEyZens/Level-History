import prisma from "../lib/prisma.js";

/**
 * Crée un nouveau commentaire sur un événement
 * Nécessite d'être authentifié (middleware verifyToken)
 */
export const createComment = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { content } = req.body;
    const authorId = req.userId;

    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid Event ID format" });
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
    // P2003 = violation de clé étrangère (événement inexistant)
    if (error.code === "P2003") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Récupère tous les commentaires d'un événement
 * Inclut les informations de l'auteur et le nombre de likes
 */
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
          select: { id: true, username: true, role: true },
        },
        // Compte le nombre de likes par commentaire
        _count: {
          select: { likes: true },
        },
      },
      // Du plus récent au plus ancien
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Supprime un commentaire par son ID
 * Nécessite les droits admin (middleware isAdmin)
 */
export const deleteComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);

    if (isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid Comment ID format" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    // P2025 = enregistrement introuvable
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Met à jour le contenu d'un commentaire existant
 */
export const updateComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const { content } = req.body;

    if (isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid Comment ID format" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    res.status(200).json({
      status: "success",
      data: updatedComment,
    });
  } catch (error) {
    // P2025 = enregistrement introuvable
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
