import prisma from "../lib/prisma.js";

const toggleLike = async (req, res) => {
  try {
    const { type, id } = req.params;
    const targetId = Number(id);
    const userId = req.userId;

    const validTypes = ["event", "comment"];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ error: "Invalid like type. Must be 'event' or 'comment'." });
    }

    const isEvent = type === "event";
    const whereClause = isEvent
      ? { userId_eventId: { userId, eventId: targetId } }
      : { userId_commentId: { userId, commentId: targetId } };

    const existingLike = await prisma.like.findUnique({
      where: whereClause,
    });

    if (existingLike) {
      await prisma.like.delete({ where: whereClause });
      return res.status(200).json({ message: `${type} unliked successfully` });
    } else {
      await prisma.like.create({
        data: {
          userId,
          ...(isEvent ? { eventId: targetId } : { commentId: targetId }),
        },
      });
      return res.status(201).json({ message: `${type} liked successfully` });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { toggleLike };
