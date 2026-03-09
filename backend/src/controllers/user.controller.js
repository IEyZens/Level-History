import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

/**
 * Récupère le profil complet de l'utilisateur connecté
 * Inclut ses 10 derniers commentaires, ses événements likés et ses compteurs
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        // 10 derniers commentaires avec l'événement associé
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        // Événements likés uniquement (pas les likes sur commentaires)
        likes: {
          where: { eventId: { not: null } },
          select: {
            event: {
              select: {
                id: true,
                title: true,
                image: true,
                date: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Compteurs globaux de commentaires et likes
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * Seuls les champs fournis sont mis à jour (mise à jour partielle)
 */
export const updateMe = async (req, res) => {
  try {
    const { username, email, avatar, password } = req.body;

    const data = {
      ...(username && { username }),
      ...(email && { email }),
      // avatar peut être une chaîne vide (suppression) donc on vérifie undefined
      ...(avatar !== undefined && { avatar }),
    };

    if (password) {
      // Hacher le nouveau mot de passe avant stockage
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Retourne les statistiques globales pour le tableau de bord admin
 * Compte les utilisateurs, événements, commentaires et likes
 */
export const getAdminStats = async (req, res) => {
  try {
    const [users, events, comments, likes] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.comment.count(),
      prisma.like.count(),
    ]);

    return res.json({ users, events, comments, likes });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Récupère la liste complète des utilisateurs (accès admin uniquement)
 * Inclut les compteurs de commentaires et likes par utilisateur
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: { select: { comments: true, likes: true } },
      },
      // Du plus récent au plus ancien
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Met à jour un utilisateur par son ID (accès admin uniquement)
 * Seuls les champs fournis sont mis à jour (mise à jour partielle)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, avatar, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(avatar !== undefined && { avatar }),
        ...(role && { role }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: { select: { comments: true, likes: true } },
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Supprime un utilisateur par son ID (accès admin uniquement)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    return res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
