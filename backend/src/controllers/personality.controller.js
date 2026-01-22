import prisma from "../lib/prisma.js";

const getAllPersonalities = async (req, res) => {
  try {
    const allPersonalities = await prisma.personality.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(allPersonalities);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPersonalityById = async (req, res) => {
  try {
    const personalityId = Number(req.params.id);

    const personality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!personality) {
      return res.status(404).json({ error: "Personality not found" });
    }

    res.status(200).json(personality);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createPersonality = async (req, res) => {
  try {
    const { name, role, biography, image, category } = req.body;
    const userRole = req.userRole;

    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    if (!name || !biography || !category || !image) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPersonnality = await prisma.personality.create({
      data: {
        name,
        role,
        biography,
        image,
        category,
      },
    });

    res.status(201).json({
      data: {
        id: newPersonnality.id,
        name: newPersonnality.name,
        role: newPersonnality.role,
        biography: newPersonnality.biography,
        image: newPersonnality.image,
        category: newPersonnality.category,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updatePersonality = async (req, res) => {
  try {
    const userRole = req.userRole;
    const { name, role, biography, image, category } = req.body;
    const personalityId = Number(req.params.id);

    if (userRole !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const check = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!check) {
      return res.status(404).json({ error: "Personality not found" });
    }

    const updatedPersonality = await prisma.personality.update({
      where: { id: personalityId },
      data: {
        name,
        role,
        biography,
        image,
        category,
      },
    });

    res.status(200).json({
      status: "success",
      data: updatedPersonality,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletePersonality = async (req, res) => {
  try {
    const userRole = req.userRole;
    const personalityId = Number(req.params.id);

    if (userRole !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    await prisma.personality.delete({
      where: { id: personalityId },
    });

    res.status(200).json({ message: "Personality deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  createPersonality,
  deletePersonality,
  getAllPersonalities,
  getPersonalityById,
  updatePersonality,
};
