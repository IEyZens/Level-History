import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

export const getMe = async (req, res) => {
  try {
    const userId = req.userId; // ✅ pas req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { username, email, avatar, password } = req.body;

    const data = {
      ...(username && { username }),
      ...(email && { email }),
      ...(avatar !== undefined && { avatar }),
    };

    if (password) {
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
