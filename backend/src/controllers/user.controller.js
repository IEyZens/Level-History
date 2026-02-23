import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id,
        username,
        email,
        role,
        avatar,
        createdAt,
      },
      comments: {
        include: {
          select: {
            id,
            content,
            createdAt,
            event: {
              select: {
                id,
                title,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      likes: {
        include: {
          where: {
            eventId: {
              not: null,
            },
          },
          select: {
            event: {
              select: {
                id,
                title,
                image,
                date,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
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
    const { username, email, avatar } = req.body;

    if (password === req.body) {
      bcrypt.hash(password, 10);
    }

    const updateUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        email,
        avatar,
      },
      select: {
        id,
        username,
        email,
        role,
        avatar,
      },
    });

    return res.json(updateUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAdminStats = async (req, res) => {
  Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.comment.count(),
    prisma.like.count(),
  ]);

  return res.json({ users, events, comments, likes });
};
