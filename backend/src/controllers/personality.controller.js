import fs from "fs";
import path from "path";
import prisma from "../lib/prisma.js";

/**
 * Récupère toutes les personnalités triées par nom alphabétique
 */
export const getAllPersonalities = async (req, res) => {
  try {
    const allPersonalities = await prisma.personality.findMany({
      orderBy: { name: "asc" },
    });
    return res.status(200).json(allPersonalities);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Récupère une personnalité par son ID
 */
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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Crée une nouvelle personnalité
 * L'image est uploadée via Multer et stockée dans /uploads
 */
export const createPersonality = async (req, res) => {
  try {
    const { name, role, biography, category, twitter, linkedin, website } =
      req.body;

    // Chemin relatif de l'image si un fichier a été uploadé
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Met à jour une personnalité existante
 * Si une nouvelle image est uploadée, l'ancienne est supprimée du disque
 */
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

    // Conserver l'image actuelle par défaut
    let imageUrl = existingPersonality.image;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;

      // Supprimer l'ancienne image du disque si elle existe
      if (existingPersonality.image) {
        const oldImagePath = path.join(
          process.cwd(),
          existingPersonality.image,
        );

        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (error) {
            // Échec non bloquant : la mise à jour continue même si la suppression échoue
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
        // Conserve les valeurs existantes si les champs ne sont pas fournis
        twitter: twitter ?? existingPersonality.twitter,
        linkedin: linkedin ?? existingPersonality.linkedin,
        website: website ?? existingPersonality.website,
      },
    });

    res.status(200).json({ status: "success", data: updatedPersonality });
  } catch (error) {
    // P2025 = enregistrement introuvable
    if (error.code === "P2025")
      return res.status(404).json({ error: "Personality not found" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Supprime une personnalité et son image associée du disque
 */
export const deletePersonality = async (req, res) => {
  try {
    const personalityId = Number(req.params.id);
    if (isNaN(personalityId))
      return res.status(400).json({ error: "Invalid ID format" });

    const personality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!personality)
      return res.status(404).json({ error: "Personality not found" });

    // Supprimer l'entrée en base en premier
    await prisma.personality.delete({ where: { id: personalityId } });

    // Supprimer l'image du disque si elle existe
    if (personality.image) {
      const imagePath = path.join(process.cwd(), personality.image);

      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          // Échec non bloquant : la personnalité est déjà supprimée en base
        }
      }
    }

    res.status(200).json({ message: "Personality deleted successfully" });
  } catch (error) {
    // P2025 = enregistrement introuvable
    if (error.code === "P2025")
      return res.status(404).json({ error: "Personality not found" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
