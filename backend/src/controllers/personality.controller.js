import fs from "fs";
import path from "path";
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
    const { name, role, biography, category, twitter, linkedin, website } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newPersonality = await prisma.personality.create({
      data: {
        name,
        role,
        biography,
        image: imageUrl,
        category,
        twitter: twitter || null,
        linkedin: linkedin || null,
        website: website || null,
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
    const { name, role, biography, category, twitter, linkedin, website } =
      req.body;

    if (isNaN(personalityId))
      return res.status(400).json({ error: "Invalid ID format" });

    const existingPersonality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!existingPersonality)
      return res.status(404).json({ error: "Personality not found" });

    let imageUrl = existingPersonality.image;

    // Si une nouvelle image est uploadée
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;

      // Supprimer l'ancienne image
      if (existingPersonality.image) {
        const oldImagePath = path.join(
          process.cwd(),
          existingPersonality.image,
        );

        // Vérifier que le fichier existe avant de le supprimer
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log(`Deleted old image: ${oldImagePath}`);
          } catch (error) {
            console.error(`Failed to delete old image: ${error.message}`);
            // Ne pas faire échouer la requête si la suppression échoue
          }
        }
      }
    }

    const updatedPersonality = await prisma.personality.update({
      where: { id: personalityId },
      data: {
        name,
        role,
        biography,
        image: imageUrl,
        category,
        twitter: twitter ?? existingPersonality.twitter,
        linkedin: linkedin ?? existingPersonality.linkedin,
        website: website ?? existingPersonality.website,
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

    const personality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!personality) {
      return res.status(404).json({ error: "Personality not found" });
    }

    // Supprimer de la base de données
    await prisma.personality.delete({ where: { id: personalityId } });

    // Supprimer l'image du disque
    if (personality.image) {
      const imagePath = path.join(process.cwd(), personality.image);

      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        } catch (error) {
          console.error(`Failed to delete image: ${error.message}`);
          // L'image n'a pas pu être supprimée, mais la personnalité est déjà supprimée
        }
      }
    }

    res.status(200).json({ message: "Personality deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025")
      return res.status(404).json({ error: "Personality not found" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
