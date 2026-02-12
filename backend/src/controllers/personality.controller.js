import prisma from "../lib/prisma.js";

export const getAllPersonalities = async (req, res) => {
  try {
    const allPersonalities = await prisma.personality.findMany({
      orderBy: { name: "asc" },
    });
    return res.status(200).json(allPersonalities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPersonalityById = async (req, res) => {
  try {
    const personalityId = Number(req.params.id);
    if (isNaN(personalityId))
      return res.status(400).json({ error: "Invalid ID format" });

    const personality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!personality)
      return res.status(404).json({ error: "Personality not found" });

    res.status(200).json(personality);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPersonality = async (req, res) => {
  try {
    const { name, role, biography, category } = req.body;

    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    if (!name || !biography || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPersonality = await prisma.personality.create({
      data: {
        name,
        role,
        biography,
        image: imageUrl,
        category,
      },
    });

    res.status(201).json({ status: "success", data: newPersonality });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePersonality = async (req, res) => {
  try {
    const personalityId = Number(req.params.id);
    const { name, role, biography, category } = req.body;

    if (isNaN(personalityId))
      return res.status(400).json({ error: "Invalid ID format" });
    if (req.userRole !== "ADMIN")
      return res.status(403).json({ error: "Access denied. Admins only." });

    const existingPersonality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!existingPersonality)
      return res.status(404).json({ error: "Personality not found" });

    let imageUrl = existingPersonality.image;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;

      /*
      const oldPath = path.join(process.cwd(), existingPersonality.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      */
    }

    const updatedPersonality = await prisma.personality.update({
      where: { id: personalityId },
      data: {
        name,
        role,
        biography,
        image: imageUrl,
        category,
      },
    });

    res.status(200).json({ status: "success", data: updatedPersonality });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025")
      return res.status(404).json({ error: "Personality not found" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePersonality = async (req, res) => {
  try {
    const personalityId = Number(req.params.id);
    if (isNaN(personalityId))
      return res.status(400).json({ error: "Invalid ID format" });
    if (req.userRole !== "ADMIN")
      return res.status(403).json({ error: "Access denied. Admins only." });

    const personality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (personality) {
      await prisma.personality.delete({ where: { id: personalityId } });

      /*
        const imagePath = path.join(process.cwd(), personality.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        */
    } else {
      return res.status(404).json({ error: "Personality not found" });
    }

    res.status(200).json({ message: "Personality deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025")
      return res.status(404).json({ error: "Personality not found" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
