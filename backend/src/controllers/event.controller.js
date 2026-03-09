import prisma from "../lib/prisma.js";

/**
 * Récupère tous les événements triés par date croissante
 * Inclut le nom de l'auteur et le nombre de likes
 */
export const getEvents = async (req, res) => {
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
        // Compte le nombre de likes par événement
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Récupère un événement par son ID
 * Inclut l'auteur, les likes et leur nombre
 */
export const getEventById = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        author: {
          select: { username: true },
        },
        // Liste des userId ayant liké (pour savoir si l'utilisateur courant a liké)
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Crée un nouvel événement
 * Nécessite d'être authentifié (middleware verifyToken)
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, image, category } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date,
        // Image optionnelle, null si non fournie
        image: image || null,
        category: category || "OTHER",
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
          category: newEvent.category,
          authorId: newEvent.authorId,
        },
      },
    });
  } catch (error) {
    // P2002 = contrainte d'unicité (titre déjà existant)
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "An event with this title already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Met à jour un événement existant
 * Conserve les valeurs actuelles si un champ n'est pas fourni
 */
export const updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const { title, description, date, image, category } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        date,
        // Conserve l'image existante si aucune nouvelle n'est fournie
        image: image ?? existingEvent.image,
        category: category ?? existingEvent.category,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    // P2025 = enregistrement introuvable
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Supprime un événement par son ID
 * Vérifie l'existence avant suppression pour retourner une 404 explicite
 */
export const deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    // P2025 = enregistrement introuvable
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
