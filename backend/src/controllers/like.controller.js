import prisma from "../lib/prisma.js";

/**
 * Bascule le like d'un utilisateur sur un événement ou un commentaire
 * Si le like existe déjà, il est supprimé (unlike) — sinon il est créé
 * @param {string} req.params.type - Type de cible : "event" ou "comment"
 * @param {string} req.params.id   - ID de la cible
 */
export const toggleLike = async (req, res) => {
  try {
    const { type, id } = req.params;
    const targetId = Number(id);
    const userId = req.userId;

    if (isNaN(targetId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const validTypes = ["event", "comment"];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ error: "Invalid like type. Must be 'event' or 'comment'." });
    }

    const isEvent = type === "event";

    // Construction de la clause where selon le type de cible
    const whereClause = isEvent
      ? { userId_eventId: { userId, eventId: targetId } }
      : { userId_commentId: { userId, commentId: targetId } };

    const existingLike = await prisma.like.findUnique({
      where: whereClause,
    });

    if (existingLike) {
      // Like existant → suppression (unlike)
      await prisma.like.delete({ where: whereClause });
      return res.status(200).json({ message: `${type} unliked successfully` });
    } else {
      // Pas de like → création
      await prisma.like.create({
        data: {
          userId,
          ...(isEvent ? { eventId: targetId } : { commentId: targetId }),
        },
      });
      return res.status(201).json({ message: `${type} liked successfully` });
    }
  } catch (error) {
    // P2003 = violation de clé étrangère (cible inexistante)
    if (error.code === "P2003") {
      const { type } = req.params;
      return res.status(404).json({ error: `${type} not found` });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
