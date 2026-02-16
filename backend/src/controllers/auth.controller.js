import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id, user.role, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: username,
          email: email,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Username or Email already taken" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.role, res);

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: email,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
