import prisma from "../lib/prisma.js";

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        authorId: req.userId,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        event: {
          id: newEvent.id,
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          authorId: newEvent.authorId,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    await prisma.event.delete({
      where: { id: Number(eventId) },
    });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const { title, description, date } = req.body;

    await prisma.event.update({
      where: { id: Number(eventId) },
      data: {
        title,
        description,
        date: new Date(date),
      },
    });

    res.status(200).json({
      status: "success",
      message: "Event updated successfully",
      data: updateEvent,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { createEvent, deleteEvent, getEvents, updateEvent };
