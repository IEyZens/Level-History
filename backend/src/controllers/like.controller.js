import prisma from "../lib/prisma.js";

const toggleLike = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.userId;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_eventId: { userId, eventId } },
      });
      return res.status(200).json({ message: "Event unliked" });
    } else {
      await prisma.like.create({
        data: { userId, eventId },
      });
      return res.status(201).json({ message: "Event liked" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { toggleLike };
